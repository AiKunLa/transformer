# transformer

- transformer
    使用来自hugging face 的大模型部署到本地浏览器中
    将模型下载到浏览器端 js开发者的智能战场

## 安装依赖
- pnpm i @xenova/transformers 这是
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
    - webworker 多线程处理nlp
        1. 再组件渲染完成之后在加载，延迟加载大模型 有利于性能
- **难点**
