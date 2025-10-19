const multisampling=4;
var sg=6;
var extrasg=1;
function generateInstance(){
inst=[];
neighbor=[];
    //背景生成
    var depth=1/2;
    var backgroundIndex=vec.prod(camera,-depth);
    backgroundIndex[0]=Math.round(backgroundIndex[0]/(scale*size*sg));
    backgroundIndex[1]=Math.round(backgroundIndex[1]/(scale*size*sg));
    function test(v){
        if(backgroundGenerated.findIndex(e=>e[0]==backgroundIndex[0]+v[0] && e[1]==backgroundIndex[1]+v[1])==-1){
        generate(vec.sum(backgroundIndex,v));
        }
    }
    for(let i=-1; i<=1; ++i){
        for(let j=-1; j<=1; ++j){
            test([i,j]);
        }
    }
    for(const b of background){
        if(-1.1/aspect<sg*b.pos[0]*size+depth*camera[0] && sg*b.pos[0]*size+depth*camera[0]<1.1/aspect && -1.1<sg*b.pos[1]*size+depth*camera[1] && sg*b.pos[1]*size+depth*camera[1]<1.1){
                      inst.push(b.color[0]*light[0]);
                      inst.push(b.color[1]*light[1]);
                      inst.push(b.color[2]*light[2]);
                      inst.push(0);
                      inst.push(camera[0]*depth+b.pos[0]*size*sg);
                      inst.push(camera[1]*depth+b.pos[1]*size*sg);
                      inst.push(0);
                      inst.push(0);
                      inst.push(1);
                      inst.push(1);
                      inst.push(sg*extrasg);
                      inst.push(0);
            }
    }
    for(const o of entity){
      if(!pose || o.info.name=="pose"){
          function pasteModel(modelname){
              for(const m of model){
                  if(m.name==o.name){
                      for(const d of m.data){
                      inst.push(d.color[0]);
                      inst.push(d.color[1]);
                      inst.push(d.color[2]);
                      inst.push(o.rot);
                      inst.push(o.mov[0]);
                      inst.push(o.mov[1]);
                      inst.push(d.position[0]*size);
                      inst.push(d.position[1]*size);
                      inst.push(o.direction[0]);
                      inst.push(o.direction[1]);
                      inst.push(o.scale);
        if(o.info.attribute!="util" || o.info.dynamic){
          inst.push(1);
        }else{
          inst.push(0);
        }
                          //ピクセル単位の衝突判定を行う
                          if(o.info.attribute=="enemy" || o.info.attribute=="item"){
                              if(vec.length(vec.sum(o.mov,camera))<=0.3){
                                  for(const M of model){
                                      for(const D of M.data){
                                      if(M.name==game.playerModel){
                                          //彼らの中心座標
                                          var p=vec.prod(d.position,size);
                                          p[0]*=o.direction[0];
                                          p[1]*=o.direction[1];
                                          p=vec.sum(vec.sum(vec.prod(p,o.scale),o.mov),camera);
                                          //衝突判定
                                          if(Math.abs(p[0]-D.position[0]*game.playerDirection[0]*size)<=size/2 && Math.abs(p[1]-game.playerDirection[1]*D.position[1]*size)<=size/2){
                                  neighbor.push(o.seed);
                                              }
                                      }
                                          }
                                      }
                              }
                            }
                      }
                  }
              }
          }
      if(!o.info.hide && (o.info.attribute!="point" || !deciding)){
        if(!modelLoaded || o.info.attribute=="util" || (-1.1/aspect<o.mov[0]+camera[0] && o.mov[0]+camera[0]<1.1/aspect && -1<o.mov[1]+camera[1] && o.mov[1]+camera[1]<1)){
        pasteModel(o.name);
      }
      }
    }
  }
};
async function init(){
  if(canvas.width!=window.innerWidth){
  canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
  }
// webgpuコンテキストの取得
const context = canvas.getContext('webgpu');
var multisampleTexture;
// deviceの取得
const g_adapter = await navigator.gpu.requestAdapter();
const g_device = await g_adapter.requestDevice();
//デバイスを割り当て
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device: g_device,
  format: presentationFormat,
  alphaMode: 'opaque'
});
const WGSL=`
struct Uniforms {
  camera : vec2<f32>,
  aspect : vec2<f32>
}
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragColor : vec4<f32>
}
fn hypot(v:vec2<f32>)->f32{
    return sqrt(pow(v.x,2)+pow(v.y,2));
}
fn rotation(v: vec2<f32>,theta: f32) -> vec2<f32>{
    let u:f32=atan2(v.y,v.x);
    let t:f32=radians(theta);
    return hypot(v)*vec2<f32>(cos(u+t),sin(u+t));
}
@vertex
fn main(@location(0) position: vec2<f32>,@location(1) color: vec3<f32>,@location(2) rot:f32,@location(3) movement:vec2<f32>,@location(4) model: vec2<f32>,@location(5) direction: vec2<f32>,@location(6) size:f32,@location(7) isDinamic:f32) -> VertexOutput {
  var output : VertexOutput;
  var q=rotation((position+model)*direction,rot)*size+movement;
  if(isDinamic==1){
  q+=uniforms.camera;
  }
  output.Position=vec4<f32>(q.x*uniforms.aspect.x,-q.y,0,1);
  output.fragColor=vec4<f32>(color,1);
  return output;
}
@fragment
fn fragmain(@location(0) fragColor: vec4<f32>) -> @location(0) vec4<f32> {
  return fragColor;
}
`;
generateVertex();
function render(){
  canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
//頂点配列
const quadVertexArray = new Float32Array(vertex);
// 頂点データを作成.
const verticesBuffer = g_device.createBuffer({
  size: quadVertexArray.byteLength,
  usage: GPUBufferUsage.VERTEX,
  mappedAtCreation: true,
});
new Float32Array(verticesBuffer.getMappedRange()).set(quadVertexArray);
verticesBuffer.unmap();

//インデックス配列
const quadIndexArray = new Uint16Array(generateIndex());
const indicesBuffer = g_device.createBuffer({
  size: quadIndexArray.byteLength,
  usage: GPUBufferUsage.INDEX,
  mappedAtCreation: true,
});
//マップしたバッファデータをセット
new Uint16Array(indicesBuffer.getMappedRange()).set(quadIndexArray);
indicesBuffer.unmap();

//Uniformバッファ
const uniformBufferSize = 4*(2+2);
  const uniformBuffer = g_device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
var bufferPosition=0;
function bind(a){
const p=new Float32Array(a);
g_device.queue.writeBuffer(
  uniformBuffer,
  bufferPosition,
  p.buffer,
  p.byteOffset,
  p.byteLength
);
bufferPosition+=p.byteLength;
}
bind(camera);
bind([aspect,0]);

//レンダーパイプラインの設定
const pipeline = g_device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: g_device.createShaderModule({
      code: WGSL,
    }),
    entryPoint: 'main',
    buffers: [
      {
        arrayStride: 4*2,
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x2',
          }
        ],
      },
        {//インスタンス
       	  arrayStride: 4*(3+1+2+2+2+1+1),
          stepMode: 'instance',
          attributes: [
            {
			  shaderLocation: 1,
              offset: 0,
              format: 'float32x3'
            },
            {
            shaderLocation: 2,
            offset: 4*3,
            format: 'float32',
            },
            {
            shaderLocation: 3,
            offset: 4*(3+1),
            format: 'float32x2',
            },
            {
              shaderLocation: 4,
              offset: 4*(3+1+2),
              format: 'float32x2'
            },
            {
              shaderLocation: 5,
              offset: 4*(3+1+2+2),
              format: 'float32x2'
            },
            {
              shaderLocation: 6,
              offset: 4*(3+1+2+2+2),
              format: 'float32'
            },
            {
              shaderLocation: 7,
              offset: 4*(3+1+2+2+2+1),
              format: 'float32'
            }
          ]
        }
    ],
  },
  fragment: {
    module: g_device.createShaderModule({
      code: WGSL,
    }),
    entryPoint: 'fragmain',
    //canvasのフォーマットを指定
    targets: [
      {
        format: presentationFormat,
      }
    ]
  },
  multisample:{
      count:multisampling
  },
  primitive: {
    topology: 'triangle-list',
  }
});

//インスタンスバッファを作成
const instancePositions=new Float32Array(inst);
  const instancesBuffer = g_device.createBuffer({
    size: instancePositions.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
  });
  new Float32Array(instancesBuffer.getMappedRange()).set(instancePositions);
  instancesBuffer.unmap();

//バインドグループを作成
const bindGroup = g_device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: {
        buffer: uniformBuffer,
      }
    }
  ]
});
//コマンドバッファの作成
const commandEncoder = g_device.createCommandEncoder();
//レンダーパスの設定
const textureView = context.getCurrentTexture().createView();
      if (multisampleTexture) {
        multisampleTexture.destroy();
      }
      multisampleTexture = g_device.createTexture({
        format: context.getCurrentTexture().format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        size: [canvas.width, canvas.height],
        sampleCount: multisampling,
      });
  const renderPassDescriptor= {
    colorAttachments: [
      {
        view: multisampleTexture.createView(),
        resolveTarget:textureView,
        clearValue: clearValue,
        loadOp: 'clear',
        storeOp: 'store',
      },
    ]
  };
  //エンコーダー
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.setVertexBuffer(0, verticesBuffer);
  passEncoder.setIndexBuffer(indicesBuffer, 'uint16');
  passEncoder.setVertexBuffer(1, instancesBuffer);
  passEncoder.drawIndexed(quadIndexArray.length,Math.floor(instancePositions.length/(3+1+2+2+2+1+1)));
  passEncoder.end();
  g_device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(render);
    animation();
}
    render();
}
