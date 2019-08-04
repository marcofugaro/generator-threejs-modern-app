const Generator = require('yeoman-generator')
const _ = require('lodash')
const superb = require('superb')
const normalizeUrl = require('normalize-url')

module.exports = class extends Generator {
	init() {
		return this.prompt([{
			name: 'title',
			message: 'What do you want to name your app?',
			default: _.kebabCase(this.appname),
			filter: prompt => _.kebabCase(prompt),
		}, {
			name: 'description',
			message: `What is your app's description?`,
			default: `My ${superb.random()} app`,
		}, {
			name: 'keepExample',
			type: 'confirm',
			message: `Would you like to keep advanced example code?`,
			default: false,
		}, {
			name: 'githubUsername',
			message: 'What is your GitHub username (or organization)?',
			store: true,
		}, {
			name: 'website',
			message: 'What is the URL of your website?',
			store: true,
			filter: prompt => prompt ? normalizeUrl(prompt) : null,
		}, {
			name: 'yarn',
      type: 'confirm',
			message: 'Would you like to use Yarn in place of npm?',
      default: true,
      store: true,
		}]).then((props) => {
      const {
				description,
				keepExample,
        githubUsername,
        yarn,
      } = props
      let { title, website, } = props

      // these are the filters, workaround for issue https://github.com/yeoman/yeoman-test/issues/29
      if (process.env.NODE_ENV === 'test') {
        title = _.kebabCase(title)
        website = website ? normalizeUrl(website) : null
      }

			const camelTitle = _.startCase(title)

			this.templateVariables = {
				title,
				camelTitle,
				description,
				keepExample,
				githubUsername,
				name: this.user.git.name(),
				email: this.user.git.email(),
				website,
        yarn,
			}

			this.fs.copyTpl(
        `${this.templatePath()}/**`,
        this.destinationPath(),
        this.templateVariables
      )

      const mv = (from, to) => this.fs.move(this.destinationPath(from), this.destinationPath(to))
      const rm = (file) => this.fs.delete(this.destinationPath(file))

      mv('babelrc', '.babelrc')
      mv('editorconfig', '.editorconfig')
      mv('eslintignore','.eslintignore')
      mv('eslintrc', '.eslintrc')
			mv('gitignore', '.gitignore')
  		mv('prettierignore','.prettierignore')
  		mv('prettierrc','.prettierrc')
			mv('_package.json', 'package.json')

			if (!keepExample) {
				rm('src/scene/Suzanne.js')
				rm('src/scene/CannonSphere.js')
				rm('src/scene/shaders')
				rm('public/assets/**')
			}

      rm('.yo-rc.json')
		})
	}

  git() {
		this.spawnCommandSync('git', ['init'])
	}

	install() {
    if (this.templateVariables.yarn) {
      this.yarnInstall()
    } else {
      this.npmInstall()
    }
	}
}
