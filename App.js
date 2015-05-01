Ext.define('CustomApp', {
extend: 'Rally.app.App',
componentCls: 'app',

launch: function() {
    var relComboBox = Ext.create('Rally.ui.combobox.ReleaseComboBox',{
        listeners:{
            ready: function(combobox){
                var releaseRef = combobox.getRecord().get('_ref'); 
                this._loadStories(releaseRef);
            },
            select: function(combobox){
                var releaseRef = combobox.getRecord().get('_ref'); 
                this._loadStories(releaseRef);
            },
            scope: this
        }
    });
    this.add(relComboBox);
},

_loadStories: function(releaseRef){
    console.log('loading stories and defects for ', releaseRef);
    var myStore = Ext.create('Rally.data.wsapi.artifact.Store',{
        models: ['User Story', 'Defect'],
        autoLoad:true,
        fetch: ['Name','ScheduleState','FormattedID', 'Changesets'],
        filters:[
            {
                property : 'Release',
                operator : '=',
                value : releaseRef
            },
            {
                property : 'ScheduleState',
                operator : '>=',
                value : 'Completed'
            }
        ],
        listeners: {
            load: function(store,records,success){
                console.log("loaded %i records", records.length);
                this._filterByEmptyChangesets(myStore);
            },
            scope:this
        }
    });
},

_filterByEmptyChangesets: function(myStore){
    console.log(myStore);
    var artifacts = myStore.getRange();
    _.each(artifacts, function(artifact) {
       if (artifact.get('Changesets').Count > 0) {
            console.log('removing ' + artifact.get('FormattedID') + " with " + artifact.get('Changesets').Count + " changeset(s)");
            myStore.remove(artifact);
       }
    });
    this._updateGrid(myStore);  
},

_createGrid: function(myStore){
    this._myGrid = Ext.create('Ext.grid.Panel', {
        title: 'Completed or Accepted Stories and Defects By Release, with no Changesets',
        store: myStore,
        columns: [
                {text: 'ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')},
                {text: 'Story Name', dataIndex: 'Name', flex: 1},
                {text: 'Schedule State', dataIndex: 'ScheduleState'}
        ],
        height: 400
    });
    this.add(this._myGrid);
},

_updateGrid: function(myStore){
    if(this._myGrid === undefined){
        this._createGrid(myStore);
    }
    else{
        this._myGrid.reconfigure(myStore);
    }
}

});
