import { useState, useEffect, useRef } from "react";
import "./App.css";
import Progress from "./components/Progress";
import AudioPlayer from "./components/AudioPlayer";


function App() {
  const [count, setCount] = useState(0);
  const worker = useRef(null);

  const [disabled, setDisabled] = useState(true);
  // 进度
  const [progress, setProgress] = useState([]);
  // 文本
  const [text, setText] = useState("I am a student");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const [output, setOutput] = useState(null);

  useEffect(() => {
    worker.current = new Worker(new URL("./worker.js", import.meta.url), {
      // 开启esmodule 模块 有的浏览器默认不使用esmodule 模块，需要手动开启
      type: "module",
    });
    worker.current.postMessage({
      text: "hello world",
    });

    const onMessageRecivied = (e) => {
      console.log(e.data);
      setCount(e.data);
    };

    worker.current.onmessage = onMessageRecivied;
    return () => {
      worker.current.removeEventListener("message", onMessageRecivied);
    };
  }, []);

  return (
    <>
      <div className="flex">
        <AudioPlayer
          audioUrl="https://cdn.freesound.org/previews/819/819183_12880153-lq.mp3"
          mimeType="audio/mpeg"
        />
      </div>
    </>
  );
}

export default App;
