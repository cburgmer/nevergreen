module.exports = function () {
    var successMessage = require('../domain/successMessage')
    var repository = require('../storage/repository')
    var trackingRepository = require('../storage/trackingRepository')(repository)
    var successRepository = require('../storage/successRepository')(repository)
    var timingRepository = require('../storage/timingRepository')(repository)
    var appender = require('./appender')(successRepository, successMessage)
    //var monitor = require('./monitor')(trackingRepository, appender)
    var migrations = require('../storage/migrations')(successRepository)

    migrations.migrate()

    var pollingTime = timingRepository.getPollingTimeInMilliseconds()

    //monitor.init()

    // run immediately
    //monitor.updateBuildMonitor()

    //schedule runs
    //setInterval(function () {
    //    monitor.updateBuildMonitor()
    //}, pollingTime)

    // react

    var monitor = require('../views/monitor')
    monitor.render(pollingTime)

    var menu = require('../views/menu')
    menu.render()
}
