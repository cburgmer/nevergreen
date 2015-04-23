var $ = require('jquery')
var React = require('react')
var InterestingProjects = require('./projectsView').InterestingProjects
var Success = require('./successView').Success
var ErrorView = require('../general/errorView').SimpleMessage
var Loading = require('../general/loading').Bars
var projectsController = require('../../controllers/projects')
var timingRepository = require('../../storage/timingRepository')
var trackingRepository = require('../../storage/trackingRepository')

module.exports = {
    MonitorSection: React.createClass({
        getInitialState: function () {
            return {
                loaded: false,
                error: false,
                projects: []
            }
        },

        render: function () {
            var content
            if (!this.state.loaded) {
                content = <Loading />

            } else if (this.state.error) {
                content = <ErrorView status={this.state.error.status} reason={this.state.error.responseText}/>

            } else if (this.hasProjects()) {
                content = <InterestingProjects projects={this.state.projects}/>

            } else {
                content = <Success />
            }

            return (
                <div className='monitor' onMouseMove={this.animateMenu}>{content}</div>
            )
        },

        componentWillMount: function () {
            projectsController.interesting(trackingRepository.getTraysContent())
                .done(this.updateProjects)
                .fail(this.updateFailed)

            var updateTimer = setInterval(function () {
                projectsController.interesting(trackingRepository.getTraysContent())
                    .done(this.updateProjects)
                    .fail(this.updateFailed)
            }.bind(this), timingRepository.getPollingTimeInMilliseconds())

            this.setState({timer: updateTimer})
        },

        componentWillUnmount: function () {
            clearInterval(this.state.timer)
            this.clearMenuTimeOut()
            this.showMenu()
        },

        componentDidMount: function () {
            this.hideMenu()
        },

        updateProjects: function (data) {
            if (this.isMounted()) {
                this.setState({
                    loaded: true,
                    error: false,
                    projects: JSON.parse(data)
                })
            }
        },

        updateFailed: function (data) {
            if (this.isMounted()) {
                this.setState({
                    loaded: true,
                    error: JSON.parse(data)
                })
            }
        },

        hasProjects: function () {
            return this.state.projects.length > 0
        },

        animateMenu: function () {
            this.clearMenuTimeOut()
            this.showMenu()
            this.setState({
                menuTimer: setInterval(function () {
                    this.hideMenu()
                }.bind(this), 1000)
            })
        },

        showMenu: function () {
            $("#menu").fadeIn()
        },

        hideMenu: function () {
            if (this.isMounted()) {
                $("#menu").fadeOut(1000)
            }
        },

        clearMenuTimeOut: function () {
            clearInterval(this.state.menuTimer)
        }
    })
}
