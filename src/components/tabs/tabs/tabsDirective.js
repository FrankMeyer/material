(function () {
  'use strict';

  angular
      .module('material.components.tabs')
      .directive('mdTabs', MdTabs);

  function MdTabs ($mdTheming) {
    return {
      scope: {
        selectedIndex: '=?mdSelected',
        stretchTabs: '=?mdStretchTabs'
      },
      transclude: true,
      template: '\
        <md-tab-wrapper ng-class="{ \'md-stretch-tabs\': $mdTabsCtrl.shouldStretchTabs() }">\
          <md-tab-data ng-transclude></md-tab-data>\
          <md-prev-button tabindex="-1"\
              ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }"\
              ng-if="$mdTabsCtrl.shouldPaginate()"\
              ng-click="$mdTabsCtrl.previousPage()">\
            <md-icon md-svg-icon="tabs-arrow"></md-icon>\
          </md-prev-button>\
          <md-next-button tabindex="-1"\
              ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }"\
              ng-if="$mdTabsCtrl.shouldPaginate()"\
              ng-click="$mdTabsCtrl.nextPage()">\
            <md-icon md-svg-icon="tabs-arrow"></md-icon>\
          </md-next-button>\
          <md-tab-canvas ng-class="{ \'md-paginated\': $mdTabsCtrl.shouldPaginate() }">\
            <md-pagination-wrapper\
                md-tab-scroll="$mdTabsCtrl.scroll($event)">\
              <md-ink-bar></md-ink-bar>\
              <md-tab-item \
                  tabindex="-1" \
                  class="md-tab" \
                  style="max-width: {{ tabWidth ? tabWidth + \'px\' : \'none\' }}" \
                  ng-repeat="tab in $mdTabsCtrl.tabs" \
                  ng-class="{ \'md-active\': tab.isActive(), \
                      \'md-focus\': tab.hasFocus(),\
                      \'md-disabled\': tab.disabled }" \
                  ng-disabled="tab.disabled" \
                  aria-selected="{{tab.getIndex() === $mdTabsCtrl.selectedIndex}}" \
                  aria-disabled="{{tab.disabled}}" \
                  data-ng-click="$mdTabsCtrl.select(tab.getIndex())">{{tab.label}}</md-tab>\
              <md-dummy-tab\
                  tabindex="0"\
                  ng-repeat="tab in $mdTabsCtrl.tabs"\
                  ng-focus="$mdTabsCtrl.focus(tab)"\
                  ng-keydown="$mdTabsCtrl.keydown($event, tab)"\
                  ng-disabled="tab.disabled">{{tab.label}}</md-dummy-tab>\
            </md-pagination-wrapper>\
          </md-tab-canvas>\
        </md-tab-wrapper>\
        <md-tab-content-wrapper>\
          <md-tab-content \
              ng-repeat="(index, tab) in $mdTabsCtrl.tabs" \
              md-tab-data="tab"\
              ng-class="{ \
                \'md-active\': tab.isActive(), \
                \'md-left\':   tab.isLeft(), \
                \'md-right\':  tab.isRight() \
              }"></md-tab-content>\
        </md-tab-content-wrapper>\
      ',
      controller: 'MdTabsController',
      controllerAs: '$mdTabsCtrl',
      link: function (scope, element) {
        //-- set default value for selectedIndex
        scope.selectedIndex = angular.isNumber(scope.selectedIndex) ? scope.selectedIndex : 0;
        //-- apply themes
        $mdTheming(element);
      }
    };
  }
})();