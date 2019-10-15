import path from 'path'
import test from 'ava'
import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import pify from 'pify'

let generator

test.beforeEach(async () => {
	await pify(helpers.testDirectory)(path.join(__dirname, 'tmp'))
	generator = helpers.createGenerator('threejs-modern-app:app', ['../app'], null, { skipInstall: true })
  generator.run = pify(generator.run.bind(generator))
})

test.serial('generates expected files', async () => {
	helpers.mockPrompt(generator, {
		title: 'test',
	})

	await generator.run()

	assert.file([
    '.git',
    'src/index.js',
    'src/scene/Box.js',
    'src/lib/AssetManager.js',
    'src/lib/WebGLApp.js',
		'.babelrc',
		'.editorconfig',
		'.eslintignore',
		'.eslintrc',
		'.gitignore',
		'.prettierignore',
		'.prettierrc',
		'LICENSE',
		'package.json',
		'README.md',
		'webpack.config.js',
	])
})

test.serial('uses the prompted description', async () => {
	helpers.mockPrompt(generator, {
		title: 'test',
		description: 'foo',
	})

	await generator.run()

  assert.jsonFileContent('package.json', { description: 'foo' })
	assert.fileContent('README.md', /> foo/)
})

test.serial('defaults to superb description', async () => {
	helpers.mockPrompt(generator, {
		title: 'test',
	})

	await generator.run()

	assert.fileContent('package.json', /"description": "My .+ app",/)
	assert.fileContent('README.md', /> My .+ app/)
})

test.serial('yarn option works', async () => {
  helpers.mockPrompt(generator, {
    title: 'test',
    yarn: true,
  })

	await generator.run()

	assert.file([
		'yarn.lock',
	])
})

test.serial('keepExample option works', async () => {
  helpers.mockPrompt(generator, {
    title: 'test',
    keepExample: true,
  })

	await generator.run()

	assert.file([
		'src/scene/Suzanne.js',
	])
	assert.fileContent('src/index.js', /import Suzanne/)
})
