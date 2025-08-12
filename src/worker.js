import {
  env, // 配置AI模型运行环境
  Tensor, // AI 模型处理数据的基本单位
  AutoTokenizer, // AI 自行分词器
  SpeechT5ForTextToSpeech, // 文本转语音模型 语音的特征
  SpeechT5HifiGan, // 语音合成模型 和音色合成
} from "@xenova/transformers";
import {encodeWAV} from "./utils.js"
// huggingFace 开源的大模型社区
// 禁用本地大模型，去请求远程的 tts模型
env.allowLocalModels = false;
// transformer.js  文本-》语音 tts
// 单例模式 核心难点
// 多次执行tts ai 业务，但是只会实例化一次
// 他的实例化开销太大了，也没有必要
class MyTextToSpeechPipeline {
  // AI 语音模型的数据源地址， 用于下载不通说话人的声音特征向量
  // 每个字，每个词
  static BASE_URL =
    "https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/";
  // 文本-》 speecht5_tts 语音特征
  static model_id = "Xenova/speecht5_tts";
  // 语音特征 -> speecht5_hifigan -> 特有的角色音频文件
  static vocoder_id = "Xenova/speecht5_hifigan";
  // 分词器实例
  static tokenizer_instance = null;
  // 模型实例
  static model_instance = null;
  // 合成实例
  static vocoder_instance = null;
  static async getInstance(progress_callback = null) {
    // 分词器实例化
    if (this.tokenizer_instance === null) {
      // 之前处理过的大模型，被预训练过的
      this.tokenizer = AutoTokenizer.from_pretrained(this.model_id, {
        progress_callback,
      });
      // console.log(this.tokenizer , '/////////////////');
    }

    if (this.model_instance === null) {
      // 模型下载
      this.model_instance = SpeechT5ForTextToSpeech.from_pretrained(
        this.model_id,
        {
          dtype: "fp32",
          progress_callback,
        }
      );
    }

    if (this.vocoder_instance === null) {
      this.vocoder_instance = SpeechT5HifiGan.from_pretrained(this.vocoder_id, {
        dtype: "fp32",
        progress_callback,
      });
    }

    return new Promise(async (resolve, reject) => {
      const result = await Promise.all([
        this.tokenizer,
        this.model_instance,
        this.vocoder_instance,
      ]);
      self.postMessage({ status: "ready" });
      resolve(result);
    });
  }

  static async getSpeakerEmbeddings(speaker_id) {
    const speaker_embeddings_url = `${this.BASE_URL}/${speaker_id}.bin`;
    // 下载文件.bin  转换数据，将二进制数据转换为float32Array  创建一个张量 构建1*512维度的张量
    const speaker_embeddings = new Tensor(
      'float32',
      new Float32Array(await 
        (await fetch(speaker_embeddings_url)).arrayBuffer()),
    [1,512]
  )
    console.log(speaker_embeddings)
  }

}

// 音色缓存
// 使用es6新增的Map 数据结构，来缓存音色
const speaker_embedding_cache = new Map();


self.onmessage = async (e) => {
  // console.log(e)
  // ai pipeline 派发一个nlp任务
  // 懒加载 llm 初始化和加载放到第一次任务调用之时

  // console.log(e)
  // return
  
  const [tokenizer, model, vocoder] = await MyTextToSpeechPipeline.getInstance(
    (x) => {
      self.postMessage(x);
    }
  );

  // token 是LLM的输入
  // 将原始的输入，分词为一个一个的word字，让后将其转为数字编码
  // 向量相似度， 大模通过使用维度来表示万事万物
  //
  // prompt -> token -> LLM （函数、向量）-》 outputs
  const { input_ids } = tokenizer(e.data.text);

  // 选择音色
  let speaker_embeddings = speaker_embedding_cache.get(e.data.speaker_id);
  if(!speaker_embeddings){
    // 若没有这个音色则 下载获取该音色的特征向量
    speaker_embeddings = await MyTextToSpeechPipeline.getSpeakerEmbeddings(e.data.speaker_id)
    // 存储
    speaker_embedding_cache.set(e.data.speaker_id, speaker_embeddings)
  }
  const {waveForm} = await model.generate_speech(
    input_ids, // 分词数字
    speaker_embeddings, // 512 维度的音频向量
    vocoder, // 合成器
  )
  // 生成的结果 是一对数字维度
  console.log(waveForm)
  const wav = encodeWAV(waveForm);
  console.log(wav,'?????')
  self.postMessage({
    statue:'complete',
    output: new Blob([wav], { type: "audio/wav" })
  })

};
