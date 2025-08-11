import { useEffect, useRef, useState } from "react";  // 添加useState导入

const AudioPlayer = ({ audioUrl, mimeType }) => {
  const audioPlayer = useRef(null);
  const audioSource = useRef(null);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);  // 添加状态标志

  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = audioUrl;
      // 不再自动播放，而是设置就绪状态
      setIsReadyToPlay(true);
    }
  }, [audioUrl]);

  // 添加播放函数，只有在用户点击时才调用
  const handlePlay = () => {
    if (audioPlayer.current && isReadyToPlay) {
      audioPlayer.current.play().catch(error => {
        console.error("播放失败:", error);
      });
    }
  };

  return (
    <div className="flex relative z-10 my-4 w-full flex-col items-center">
      <audio
        ref={audioPlayer}
        controls
        className="w-full h-14 rounded-lg bg-white 
                shadow-xl shadow-black/5 ring-1 ring-slate-700/10"
      >
        <source ref={audioSource} type={mimeType} />
        您的浏览器不支持音频元素。
      </audio>
      {/* 添加播放按钮，如果浏览器不支持自动播放或需要用户交互 */}
      <button
        onClick={handlePlay}
        disabled={!isReadyToPlay}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        {isReadyToPlay ? '播放音频' : '准备中...'}
      </button>
    </div>
  );
};

export default AudioPlayer;
