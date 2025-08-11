# transformer

- transformer
    使用来自hugging face 的大模型部署到本地浏览器中
    将模型下载到浏览器端 js开发者的智能战场

## 安装依赖
- pnpm i @xenova/transformers 这是transformer.js 的库
- pnpm i tailwindcss @tailwindcss/vite 
    - 配置插件
        ```js
            import tailwindcss from '@tailwindcss/vite'
            export default defineConfig({
                plugins: [tailwindcss()],
            })
        ```
        再index.css中引入tailwindcss
            ```js
                import tailwindcss from 'tailwindcss'
            ```




## 项目亮点和难点
- **亮点**
    - 使用transformer.js 的端模型
    - 使用tailwindcss 的原子性css 机会不用再写css了，类名语义化，适合于AI生成
        解决移动端高校适配  w-full + max-w-xl 移动端适配
        当为移动端时，使用w-full 宽度为100%，max-w-xl 最大宽度为1280px，当屏幕宽度大于1280px时，使用max-w-xl 
    - webworker 多线程处理nlp
        1. 再组件渲染完成之后在加载，延迟加载大模型 有利于性能
- **难点**
    - AI大模型的接口API  
    - ChatBot
    - Coze工作流
    - 端模型的部署
1. 使用单例模式封装 MyTextToSpeechPipeline 
    - 调用getInstance 方法获取实例，只有在第一次调用时才会创建实例
    - 延迟加载，只有在第一次调用时才会加载模型，避免重复加载模型
    - Promise.all + nlp 流程的理解 (tokenizer -> model -> vocoder)
        tokenizer 分词器  将文本转换为模型可以理解的输入
        model 模型 文字转语音，不带情感
        vocoder 语音特征  模型输出的语音特征