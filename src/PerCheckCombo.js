Ext.define('Ext.ux.PerCheckCombo', {
  extend: 'Ext.ux.CheckCombo',
  alias: 'widget.percheckcombo',
  frame: false,
  createPicker: function() {
    var me = this,
      picker,
      menuCls = Ext.baseCSSPrefix + 'menu',
      opts = Ext.apply(
        {
          pickerField: me,
          selModel: {
            mode: me.multiSelect ? 'SIMPLE' : 'SINGLE',
          },
          floating: true,
          hidden: true,
          ownerCt: me.ownerCt,
          cls: me.el.up('.' + menuCls) ? menuCls : '',
          store: me.store,
          displayField: me.displayField,
          focusOnToFront: false,
          pageSize: me.pageSize,
          disableFieldFeature: false,
          bind: {
            store: this.store,
          },
          listeners: {
            beforeselect: function(combo, record, index) {
              if (record.get(me.disablefield) != 0) {
                // combo.setValue(record.get(me.displayField));
                // combo.setValue(record.get(me.displayField));
                // console.log(combo);
              } else {
                return false;
              }
              // Cancel the default action
            },
          },

          tpl: [
            '<tpl if="' + me.disableFieldFeature + ' == ' + true + '">',
            '<tpl><ul><tpl for=".">',
            '<tpl if="disablefield != \'0\' ">',
            '<li role="option"  class="' +
              Ext.baseCSSPrefix +
              'boundlist-item"><span class="x-combo-checker">&nbsp;</span> {' +
              me.displayField +
              '}</li>',
            '<tpl else>',
            '<li role="option"  class="' +
              Ext.baseCSSPrefix +
              'boundlist-item" ><span><input type="checkbox" disabled="disabled" />&nbsp;</span> {' +
              me.displayField +
              '}</li>',
            '</tpl>',
            '</tpl></ul></tpl>',
            '<tpl else>',
            '<tpl><ul><tpl for=".">',
            '<li role="option"  class="' +
              Ext.baseCSSPrefix +
              'boundlist-item"><span class="x-combo-checker">&nbsp;</span> {' +
              me.displayField +
              '}</li>',
            '</tpl></ul></tpl>',
            '</tpl>',
          ],
        },
        me.listConfig,
        me.defaultListConfig,
      );

    picker = me.picker = Ext.create('Ext.view.BoundList', opts);
    if (me.pageSize) {
      picker.pagingToolbar.on('beforechange', me.onPageChange, me);
    }

    me.mon(picker, {
      itemclick: me.onItemClick,
      refresh: me.onListRefresh,
      scope: me,
    });

    me.mon(picker.getSelectionModel(), {
      beforeselect: me.onBeforeSelect,
      beforedeselect: me.onBeforeDeselect,
      selectionchange: me.onListSelectionChange,
      scope: me,
    });

    me.store.on('load', function(store) {
      if (store.getTotalCount() == 0) {
        me.allSelectorHidden = true;
        if (me.allSelector != false) me.allSelector.setStyle('display', 'none');
        if (me.noData != false) me.noData.setStyle('display', 'block');
      } else {
        me.allSelectorHidden = false;
        if (me.allSelector != false) me.allSelector.setStyle('display', 'block');
        if (me.noData != false) me.noData.setStyle('display', 'none');
      }
    });

    return picker;
  },

  setValue: function(value) {
    //Filter values based on disable condition
    if (typeof value != 'undefined' && this.disableFieldFeature === true) {
      var finalValue = [];
      if (typeof value != 'undefined') {
        for (i in value) {
          //console.log(value[i]);
          if (value[i].raw.disablefield > 0) {
            finalValue.push(value[i]);
          }
        }
      } else {
        if (value.raw.disablefield > 0) {
          finalValue = value;
        }
      }
      value = finalValue;
    }

    this.value = value;
    if (!value) {
      if (this.allSelector != false) this.allSelector.removeCls('x-boundlist-selected');
      return this.callParent(arguments);
    }

    if (typeof value == 'string') {
      var me = this,
        records = [],
        vals = value.split(',');

      if (value == '') {
        if (me.allSelector != false) me.allSelector.removeCls('x-boundlist-selected');
      } else {
        if (vals.length == me.store.getCount() && vals.length != 0) {
          if (me.allSelector != false) me.allSelector.addCls('x-boundlist-selected');
          else me.afterExpandCheck = true;
        }
      }

      Ext.each(vals, function(val) {
        var record = me.store.getById(parseInt(val));
        if (record.get('disablefield') > 0) if (record) records.push(record);
      });
      return me.setValue(records);
    } else return this.callParent(arguments);
  },

  // set value in combo list
  expand: function() {
    var me = this,
      bodyEl,
      picker,
      collapseIf;

    if (me.rendered && !me.isExpanded && !me.isDestroyed) {
      bodyEl = me.bodyEl;
      picker = me.getPicker();
      collapseIf = me.collapseIf;

      // show the picker and set isExpanded flag
      picker.show();
      me.isExpanded = true;
      me.alignPicker();
      bodyEl.addCls(me.openCls);

      if (me.noData == false)
        me.noData = picker
          .getEl()
          .down('.x-boundlist-list-ct')
          .insertHtml(
            'beforeBegin',
            '<div class="x-boundlist-item" role="option">' + me.noDataText + '</div>',
            true,
          );
      if (me.addAllSelector == true && me.allSelector == false) {
        var selectedvalues = this.value;
        var vals = String(selectedvalues).split(',');
        if (vals.length == me.store.getCount() && vals.length != 0) {
          me.allSelector = picker
            .getEl()
            .down('.x-boundlist-list-ct')
            .insertHtml(
              'beforeBegin',
              '<div class="x-boundlist-item x-boundlist-selected" role="option"><span  class="x-combo-checker">&nbsp;</span> ' +
                me.allText +
                '</div>',
              true,
            );
        } else {
          me.allSelector = picker
            .getEl()
            .down('.x-boundlist-list-ct')
            .insertHtml(
              'beforeBegin',
              '<div class="x-boundlist-item" role="option"><span class="x-combo-checker">&nbsp;</span> ' +
                me.allText +
                '</div>',
              true,
            );
        }
        me.allSelector.on('click', function(e) {
          if (me.allSelector.hasCls('x-boundlist-selected')) {
            me.allSelector.removeCls('x-boundlist-selected');
            me.setValue('');
            me.fireEvent('select', me, []);
          } else {
            var records = [];
            me.store.each(function(record) {
              records.push(record);
            });
            me.allSelector.addCls('x-boundlist-selected');
            me.select(records);
            me.fireEvent('select', me, records);
          }
        });

        if (me.allSelectorHidden == true) me.allSelector.hide();
        else me.allSelector.show();

        if (me.afterExpandCheck == true) {
          me.allSelector.addCls('x-boundlist-selected');
          me.afterExpandCheck = false;
        }
      }

      // monitor clicking and mousewheel
      me.mon(Ext.getDoc(), {
        mousewheel: collapseIf,
        mousedown: collapseIf,
        scope: me,
      });
      Ext.EventManager.onWindowResize(me.alignPicker, me);
      me.fireEvent('expand', me);
      me.onExpand();
    } else {
      me.fireEvent('expand', me);
      me.onExpand();
    }
  },

  onListSelectionChange: function(list, selectedRecords) {
    var me = this,
      isMulti = me.multiSelect,
      hasRecords = selectedRecords.length > 0;
    // Only react to selection if it is not called from setValue, and if our list is
    // expanded (ignores changes to the selection model triggered elsewhere)
    if (!me.ignoreSelection && me.isExpanded) {
      if (!isMulti) {
        Ext.defer(me.collapse, 1, me);
      }
      /*
       * Only set the value here if we're in multi selection mode or we have
       * a selection. Otherwise setValue will be called with an empty value
       * which will cause the change event to fire twice.
       */
      if (isMulti || hasRecords) {
        me.setValue(selectedRecords, false);
      }
      if (hasRecords) {
        me.fireEvent('select', me, selectedRecords);
      }
      me.inputEl.focus();

      if (me.addAllSelector == true && me.allSelector != false) {
        if (selectedRecords.length == me.store.getTotalCount())
          me.allSelector.addCls('x-boundlist-selected');
        else me.allSelector.removeCls('x-boundlist-selected');
      }
    }
  },
});
