var $ = require('jquery')
var adminController = require('../../../src/js/config/adminController')
var config = require('../../../src/js/config/config')

describe('Configurable build monitor', function () {

    describe('get projects', function () {
        it('gets the projects using the api', function () {
            var projectNames = ['proj-1', 'proj-2']
            spyOn($, 'getJSON').and.callFake(function (_) {
                $.Deferred().resolve(projectNames).promise()
                return {complete: function(){}}
            })
            spyOn(config, 'load').and.returnValue({cctray: 'some-url'})
            var callbackFunction = function (data) {
            }

            var projects = adminController.getProjects(config, callbackFunction, function(){})

            expect($.getJSON).toHaveBeenCalledWith('/api/projects', {url: 'some-url'}, callbackFunction)
        })

        it('shows and hides spinner whilst getting projects', function () {
            var adminView = {showSpinner: function () { }, hideSpinner: function () {}}
            spyOn($, 'getJSON').and.callFake(function (_) {
                $.Deferred().resolve(['foo']).promise()
                return {complete: function(){adminView.hideSpinner()}}
            })
            spyOn(adminView, 'showSpinner')
            spyOn(adminView, 'hideSpinner')

            adminController.getProjects(config, function (data) {}, adminView.showSpinner)

            expect(adminView.showSpinner).toHaveBeenCalled()
            expect(adminView.hideSpinner).toHaveBeenCalled()
        })
    })

    it('saves the included projects to local storage', function () {
        spyOn(localStorage, 'setItem')

        adminController.saveIncludedProjects(['proj-1', 'proj-2'])

        expect(localStorage.setItem).toHaveBeenCalledWith('includedProjects', ['proj-1', 'proj-2'])
    })


    it('saves success text', function () {
        spyOn(localStorage, 'setItem')

        adminController.saveSuccessText('anything')

        expect(localStorage.setItem).toHaveBeenCalledWith('successText', 'anything')
    })

    it('saves all projects', function() {
        spyOn(localStorage, 'setItem')

        adminController.saveAllProjects(['proj-1', 'proj-2'])

        expect(localStorage.setItem).toHaveBeenCalledWith('allProjects', ['proj-1', 'proj-2'])
    })

})
