const replicateRouter = require('express').Router()
const Replicate = require('replicate')

replicateRouter.post('/', async (request, response) => {
  const replicate = new Replicate()
  const { prompt } = request.body

  const input = {
    steps: 28,
    prompt,
    lora_url: '',
    control_type: 'depth',
    control_image: 'https://hardzone.es/app/uploads-hardzone.es/2024/07/silent-hill-fifa.jpg?x=480&y=375&quality=40',
    lora_strength: 1,
    output_format: 'webp',
    guidance_scale: 2.5,
    output_quality: 100,
    negative_prompt: 'low quality, ugly, distorted, artefacts',
    control_strength: 0.45,
    depth_preprocessor: 'DepthAnything',
    soft_edge_preprocessor: 'HED',
    image_to_image_strength: 0,
    return_preprocessed_image: false
  }

  const output = await replicate.run('xlabs-ai/flux-dev-controlnet:f2c31c31d81278a91b2447a304dae654c64a5d5a70340fba811bb1cbd41019a2', { input })
  console.log(output)
  response.json(output)
})

module.exports = replicateRouter