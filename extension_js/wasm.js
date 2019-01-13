const memory = new WebAssembly.Memory({initial: 1});
const file = 'wasm/server.wasm';
WebAssembly.instantiateStreaming(
  fetch(file),
  {imports: {memory}}
).then(result => {
  console.log('wasm 读取 成功');
  if (!result || !result.instance) {
    return;
  }
  console.log('wasm 创建 成功');
});