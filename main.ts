import fs from 'fs/promises'
import { join } from 'node:path'
import { defineCommand, runMain } from 'citty'
import { execa } from 'execa'

const main = defineCommand({
  meta: {
    name: 'Compressor',
    version: '1.0.0',
    description: 'cli to compress images',
  },
  args: {
    path: {
      type: 'string',
      description: 'image directory',
      required: true,
    },
    extension: {
      type: 'string',
      description: 'image extension',
      required: true,
    },
  },
  run({ args }) {
    console.log(args)
    compressImages(args.path, args.extension)
  },
})

runMain(main)

async function compressImages(path: Buffer | string, imageFormat: string) {
  const images = (await fs.readdir(path)).filter((entry) => entry.endsWith(imageFormat))

  if (images.length === 0) {
    console.log(`No ${imageFormat} images found in the specified directory.`)
    process.exit(0)
  }

  for (const image of images) {
    const inputPath = join(path, image)
    const outputName = image.replace(imageFormat, '.jpg')
    const outputPath = join(path, outputName)

    const command = 'ffmpeg'
    const args = ['-i', inputPath, outputPath]

    const alreadyProcessed = await isAlreadyProcessed(outputPath)

    if (alreadyProcessed) {
      console.log(`${inputPath} already processed.`)
      continue
    }

    execa(command, args)
      .then(() => console.log(`${inputPath} converted successfully.`))
      .catch((error) => console.error(`Error converting ${inputPath}: ${error.stderr}`))
  }
}

async function isAlreadyProcessed(outputPath: string): Promise<boolean> {
  try {
    await fs.access(outputPath, fs.constants.F_OK)
    return true
  } catch (err) {
    return false
  }
}
