var React = require('react')
var _ = require('lodash')
var trackingRepository = require('../../storage/trackingRepository')
var projectsGateway = require('../../gateways/projectsGateway')
var trays = require('../../controllers/trays')
var Projects = require('./projects').Projects
var TraySettings = require('./traySettings').TraySettings
var AsyncActionWrapper = require('../general/asyncActionWrapper').AsyncActionWrapper

module.exports = {
    TrayContainer: React.createClass({
        propTypes: {
            trayId: React.PropTypes.string.isRequired,
            removeTray: React.PropTypes.func.isRequired
        },

        getInitialState: function () {
            return {
                showSettings: false,
                tray: trackingRepository.getTray(this.props.trayId),
                retrievedProjects: [],
                hidden: false
            }
        },

        render: function () {
            var content

            if (this.state.showSettings) {
                content = <TraySettings trayId={this.props.trayId} removeTray={this.props.removeTray}/>
            } else {
                var projects = trays.projects(this.state.tray, this.state.retrievedProjects)
                var doneView = <Projects projects={projects} includeAll={this.includeAll} excludeAll={this.excludeAll} selectProject={this.selectProject}/>
                content = <AsyncActionWrapper promise={this.fetchProjects} doneView={doneView}/>
            }

            var hideText = this.state.hidden ? 'expand tray' : 'collapse tray'
            var settingsText = this.state.showSettings ? 'show projects' : 'show settings'

            return (
                <section className='tray'>
                    <div className='tray-title-container'>
                        <button className='tray-hidden-button' onClick={this.toggleHidden} title={hideText}>
                            <span className={'icon-' + (this.state.hidden ? 'circle-down' : 'circle-up') }></span>
                            <span className='visually-hidden'>{hideText}</span>
                        </button>
                        <h3 className='tray-title'>{this.state.tray.url}</h3>
                        <button className='tray-settings-button' onClick={this.toggleSettingsView} title={settingsText}>
                            <span className={'icon-' + (this.state.showSettings ? 'list' : 'cog') }></span>
                            <span className='visually-hidden'>{settingsText}</span>
                        </button>
                    </div>
                    {this.state.hidden ? '' : content}
                </section>
            )
        },

        toggleSettingsView: function () {
            this.setState({showSettings: !this.state.showSettings})
        },

        toggleHidden: function () {
            this.setState({hidden: !this.state.hidden})
        },

        selectProject: function (name, included) {
            var command
            if (included) {
                command = {$push: [name]}
            } else {
                command = {$splice: [[this.state.tray.includedProjects.indexOf(name), 1]]}
            }

            var updatedTray = React.addons.update(this.state.tray, {
                includedProjects: command
            })
            this.setState({tray: updatedTray})
        },

        includeAll: function () {
            var updatedTray = React.addons.update(this.state.tray, {
                includedProjects: {$set: this.state.retrievedProjects}
            })
            this.setState({tray: updatedTray})
        },

        excludeAll: function () {
            var updatedTray = React.addons.update(this.state.tray, {
                includedProjects: {$set: []}
            })
            this.setState({tray: updatedTray})
        },

        componentWillUpdate: function (nextProps, nextState) {
            if (this.state.tray !== nextState.tray) {
                var updatedTray = _.assign({}, nextState.tray, {previousProjects: this.state.retrievedProjects})
                trackingRepository.saveTray(this.props.trayId, updatedTray)
            }
        },

        projectsLoaded: function (data) {
            if (this.isMounted()) {
                var retrievedProjectNames = data.map(function (project) {
                    return project.name
                })
                this.setState({retrievedProjects: retrievedProjectNames})
            }
        },

        fetchProjects: function () {
            return projectsGateway.fetchAll(this.state.tray)
                .done(this.projectsLoaded)
        }
    })

}