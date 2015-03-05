var $ = require('jquery')
var ScaleText = require('scale-text')

module.exports = {
    styleProjects: function (projects, $container, $view) {
        resizeEachContainer(projects, $container, $view)
        scaleFontToContainerSize(projects, $container, $view)
    }
}

function resizeEachContainer(projects, $container, $view) {
    $container
        .height(buildStatusHeight(projects, $view))
        .width(buildStatusWidth(projects, $view))
}

var maxColumns = 3
var buildStatusPadding = 11

function numberOfColumns(projects) {
    return Math.min(maxColumns, projects.length)
}

function numberOfRows(projects) {
    return Math.ceil(projects.length / maxColumns)
}

function buildStatusWidth(projects, $view) {
    return $view.innerWidth() / numberOfColumns(projects) - buildStatusPadding
}

function buildStatusHeight(projects, $view) {
    return window.innerHeight / numberOfRows(projects) - buildStatusPadding
}

function everyPieceOfTextOnTheScreen(projects) {
    return projects.map(function (project) {
        return project.name
    })
}

function scaleFontToContainerSize(projects, $container, $view) {
    $container.css('font-size',
        new ScaleText(
            everyPieceOfTextOnTheScreen(projects),
            buildStatusHeight(projects, $view),
            buildStatusWidth(projects, $view)).ideal()
    )
}