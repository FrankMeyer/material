(function () {
  'use strict';
  angular
      .module('material.components.tabs')
      .directive('mdTabContent', MdTabContent);

  function MdTabContent ($compile, $mdUtil) {
    return {
      scope: {
        tab: '=mdTabData',
        active: '=mdActive'
      },
      link: link
    };
    function link (scope, element) {
      element.html(scope.tab.template);
      $compile(element.contents())(scope.tab.parent);
      scope.$watch('active', function (value, oldValue) {
        if (!value) scope.$$postDigest(function () { $mdUtil.disconnectScope(scope.tab.parent); });
        else if (!oldValue) $mdUtil.reconnectScope(scope.tab.parent);
      });
    }
  }
})();
