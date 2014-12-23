(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .directive('MdTabItem', MdTabItem);

  function MdTabItem () {
    return {
      require: '^mdTabs',
      link: link
    };
    function link (scope, element, attr, tabsCtrl) {}
  }
})();