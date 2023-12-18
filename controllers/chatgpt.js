const OpenAI = require("openai");
const path = require('path');
const fs = require('fs').promises;
const fileSystem = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function convertVideoToAudio(url, startTime, duration) {
  try {
    const urlParsed = new URL(url);
    const fileNameWithoutExt = path.basename(urlParsed.pathname, path.extname(urlParsed.pathname));
    const outputDir = path.join(process.cwd(), 'public', 'temp');
    const outputPath = path.join(outputDir, fileNameWithoutExt + '.mp3');
    const ffmpegCommand = `ffmpeg -ss ${startTime} -i "${url}" -t ${duration} -q:a 0 -map a "${outputPath}"`;

    const { stdout, stderr } = await exec(ffmpegCommand);
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    return outputPath;
  } catch (error) {
    console.error(`Error in convertVideoToAudio: ${error.message}`);
    return null;
  }
}

const openai = new OpenAI();

async function deleteFileIfExists(videoPath) {
  if (!videoPath) return null
  try {
    await fs.access(videoPath);
    await fs.unlink(videoPath);
    console.log('File deleted successfully:', videoPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File does not exist, no action taken:', videoPath);
    } else {
      console.error('Error deleting file:', error);
    }
  }
}

async function chatgpt(req, res) {
  try {

    const {videoUrl, startTime, duration, question } = req.body

    let videoPath = null
    if(startTime && videoUrl && duration){
      videoPath = await convertVideoToAudio(videoUrl, startTime, duration);
    }

    let newContent = question
    let transcription=null

    if(videoPath){
      let audio_file= fileSystem.createReadStream(videoPath)
      transcription = await openai.audio.transcriptions.create({
        file: audio_file,
        model: "whisper-1",
      });
    }

    if(transcription && transcription.text){
      newContent = `this is instruction do not mention it your response(i want to see a important and concise question  from this script like: did you get stuck on $topic?): ${transcription.text}`
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: newContent }],
      model: "gpt-3.5-turbo",
    });

    await deleteFileIfExists(videoPath);

    res.status(200).send({ "body": completion.choices });
  } catch (error) {
    console.error(`Error in chatgpt function: ${error.message}`);
    res.status(500).send({ "error": error.message });
  }
}

module.exports = { chatgpt };
