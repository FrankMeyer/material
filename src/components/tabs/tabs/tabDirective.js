(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .directive('mdTab', MdTab);

  function MdTab () {
    return {
      require: '^mdTabs',
      terminal: true,
      scope: {
        label: '@',
        mdActive: '=?',
        ngDisabled: '=?'
      },
      link: link
    };

    function link (scope, element, attr, tabsCtrl) {
      var tabs = element.parent()[0].getElementsByTagName('md-tab'),
          index = Array.prototype.indexOf.call(tabs, element[0]);
      tabsCtrl.insertTab({
        scope: scope,
        parent: scope.$parent,
        index: index,
        template: element.html(),
        label: attr.label
      }, index);
    }
  }
})();
