(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .controller('MdTabsController', MdTabsController);

  function MdTabsController ($scope, $element, $window, $timeout, $mdConstant) {
    var ctrl = this,
        elements = {
          tabs:    $element[0].getElementsByClassName('md-tab'),
          dummies: $element[0].getElementsByTagName('md-dummy-tab'),
          canvas:  $element[0].getElementsByTagName('md-tab-canvas')[0],
          inkBar:  $element[0].getElementsByTagName('md-ink-bar')[0],
          wrapper: $element[0].getElementsByTagName('md-pagination-wrapper')[0]
        };

    ctrl.scope = $scope;
    ctrl.parent = $scope.$parent;
    ctrl.tabs = [];
    ctrl.insertTab = insertTab;
    ctrl.lastSelectedIndex = null;
    ctrl.focusIndex = null;
    ctrl.shouldPaginate = shouldPaginate;
    ctrl.offsetLeft = 0;

    ctrl.select = select;
    ctrl.scroll = scroll;
    ctrl.nextPage = nextPage;
    ctrl.previousPage = previousPage;
    ctrl.focus = focus;
    ctrl.keydown = keydown;
    ctrl.canPageForward = canPageForward;
    ctrl.canPageBack = canPageBack;

    init();

    function init () {
      $scope.$watch('selectedIndex', handleSelectedIndexChange);
      $scope.$watch('$mdTabsCtrl.focusIndex', handleFocusIndexChange);
      $scope.$watch('$mdTabsCtrl.offsetLeft', updateScroll);
      angular.element($window).on('resize', function () { $scope.$apply(handleWindowResize); });
      $timeout(updateInkBarStyles, 0, false);
    }

    function keydown (event, data) {
      var newIndex;
      switch (event.keyCode) {
        case $mdConstant.KEY_CODE.LEFT_ARROW:
          handleArrowKey(-1);
          break;
        case $mdConstant.KEY_CODE.RIGHT_ARROW:
          handleArrowKey(1);
          break;
        case $mdConstant.KEY_CODE.SPACE:
        case $mdConstant.KEY_CODE.ENTER:
          event.preventDefault();
          $scope.selectedIndex = ctrl.focusIndex = data.getIndex();
          break;
      }
      function handleArrowKey (inc) {
        event.preventDefault();
        ctrl.focusIndex = data.getIndex();
        for (newIndex = ctrl.focusIndex + inc;
             ctrl.tabs[newIndex] && ctrl.tabs[newIndex].disabled;
             newIndex += inc) {}
        if (ctrl.tabs[newIndex]) ctrl.focusIndex = newIndex;
      }
    }

    function handleFocusIndexChange (newIndex, oldIndex) {
      if (newIndex === oldIndex) return;
      if (!elements.dummies[newIndex])  return;
      if (angular.isNumber(newIndex)) elements.dummies[newIndex].focus();
      if (angular.isNumber(oldIndex)) elements.dummies[oldIndex].blur();
      adjustOffset();
    }

    function adjustOffset () {
      var tab = elements.tabs[ctrl.focusIndex],
          left = tab.offsetLeft,
          right = tab.offsetWidth + left;
      ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements.canvas.clientWidth));
      ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
    }

    function handleWindowResize () {
      ctrl.lastSelectedIndex = $scope.selectedIndex;
      updateInkBarStyles();
    }

    function insertTab (tabData, index) {
      var proto = {
            getIndex: function () { return ctrl.tabs.indexOf(tab); },
            isActive: function () { return this.getIndex() === $scope.selectedIndex; },
            isLeft:   function () { return this.getIndex() < $scope.selectedIndex; },
            isRight:  function () { return this.getIndex() > $scope.selectedIndex; },
            hasFocus: function () { return this.getIndex() === ctrl.focusIndex; }
          },
          tab = angular.extend(proto, tabData);
      if (angular.isDefined(index)) {
        ctrl.tabs.splice(index, 0, tab);
      } else {
        ctrl.tabs.push(tab);
      }
    }

    function handleSelectedIndexChange (newValue, oldValue) {
      if (newValue === oldValue) return;
      $scope.selectedIndex = getNearestSafeIndex(newValue);
      ctrl.lastSelectedIndex = oldValue;
      updateInkBarStyles();
    }

    function updateInkBarStyles () {
      if (!ctrl.tabs.length) return;
      var index = $scope.selectedIndex,
          totalWidth = elements.wrapper.offsetWidth,
          tab = elements.tabs[index],
          left = tab.offsetLeft,
          right = totalWidth - left - tab.offsetWidth;
      updateInkBarClassName();
      angular.element(elements.inkBar).css({ left: left + 'px', right: right + 'px' });

    }

    function updateInkBarClassName () {
      var newIndex = $scope.selectedIndex,
          oldIndex = ctrl.lastSelectedIndex,
          ink = angular.element(elements.inkBar);
      ink.removeClass('md-left md-right');
      if (!angular.isNumber(oldIndex)) return;
      if (newIndex < oldIndex) {
        ink.addClass('md-left');
      } else if (newIndex > oldIndex) {
        ink.addClass('md-right');
      }
    }

    function getNearestSafeIndex(newIndex) {
      var maxOffset = Math.max(ctrl.tabs.length - newIndex, newIndex),
          i, tab;
      for (i = 0; i <= maxOffset; i++) {
        tab = ctrl.tabs[newIndex + i];
        if (tab && (tab.disabled !== true && tab.active !== false)) return tab.getIndex();
        tab = ctrl.tabs[newIndex - i];
        if (tab && (tab.disabled !== true && tab.active !== false)) return tab.getIndex();
      }
      return newIndex;
    }

    function shouldStretchTabs () {
      switch ($scope.stretchTabs) {
        case 0:
        case 'always': return true;
        case 'never':  return false;
        default:       return $window.matchMedia('(max-width: 600px)').matches;
      }
    }

    function getMaxWidth () {
      var maxWidth = 0;
      angular.forEach(elements.tabs, function (tab) {
        maxWidth = Math.max(tab.offsetWidth, maxWidth);
      });
      return maxWidth;
    }

    function shouldPaginate () {
      var canvasWidth = $element.prop('clientWidth');
      if (shouldStretchTabs()) {
        return ctrl.tabs.length * getMaxWidth() > canvasWidth;
      } else {
        angular.forEach(elements.tabs, function (tab) {
          canvasWidth -= tab.offsetWidth;
        });
        return canvasWidth < 0;
      }
    }

    function select (index) {
      ctrl.focusIndex = $scope.selectedIndex = index;
    }

    function focus (tab) {
      ctrl.focusIndex = tab.getIndex();
    }

    function scroll (event) {
      event.preventDefault();
      ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
    }

    function fixOffset (value) {
      var lastTab = elements.tabs[elements.tabs.length - 1],
          totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
      value = Math.max(0, value);
      value = Math.min(totalWidth - elements.canvas.clientWidth, value);
      return value;
    }

    function updateScroll () {
      //-- manually apply the styles to the pagination element
      angular.element(elements.wrapper).css('transform', 'translate3d(-' + ctrl.offsetLeft + 'px, 0, 0)');
    }

    function nextPage () {
      var viewportWidth = elements.canvas.clientWidth,
          totalWidth = viewportWidth + ctrl.offsetLeft,
          i, tab;
      for (i = 0; i < elements.tabs.length; i++) {
        tab = elements.tabs[i];
        if (tab.offsetLeft + tab.offsetWidth > totalWidth) break;
      }
      ctrl.offsetLeft = fixOffset(tab.offsetLeft);
    }

    function previousPage () {
      var i, tab;
      for (i = 0; i < elements.tabs.length; i++) {
        tab = elements.tabs[i];
        if (tab.offsetLeft + tab.offsetWidth >= ctrl.offsetLeft) break;
      }
      ctrl.offsetLeft = fixOffset(tab.offsetLeft + tab.offsetWidth - elements.canvas.clientWidth);
    }

    function canPageBack () {
      return ctrl.offsetLeft > 0;
    }

    function canPageForward () {
      var lastTab = elements.tabs[elements.tabs.length - 1];
      return lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth + ctrl.offsetLeft;
    }
  }
})();