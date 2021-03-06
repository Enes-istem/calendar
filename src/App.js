
import './App.css';
import * as React from 'react';
import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth, Week } from '@syncfusion/ej2-react-schedule';

import { extend, closest, remove, addClass } from '@syncfusion/ej2-base';
import { SampleBase } from './sample-base';

import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import * as dataSource from './datasource.json';
/**
 * schedule resources group-editing sample
 */
export class App extends SampleBase {
    constructor() {
        super(...arguments);
        this.isTreeItemDropped = false;
        this.draggedItemId = '';
        this.allowDragAndDrops = true;
        this.fields = { dataSource: dataSource.waitingList, id: 'Id', text: 'Name' };
        this.data = extend([], dataSource.hospitalData, null, true);
        this.departmentData = [
            { Text: 'GENERAL', Id: 1, Color: '#bbdc00' },
            
        ];
        this.consultantData = [
            { Text: 'Alice', Id: 1, GroupId: 1, Color: '#bbdc00', Designation: 'General Manager' },
        ];
    }
    getConsultantName(value) {
        return value.resourceData[value.resource.textField];
    }
    getConsultantImage(value) {
        let resourceName = this.getConsultantName(value);
        return resourceName.toLowerCase();
    }
    getConsultantDesignation(value) {
        return value.resourceData.Designation;
    }
    resourceHeaderTemplate(props) {
        return (<div className="template-wrap"><div className="specialist-category"><div className={"specialist-image " + this.getConsultantImage(props)}></div><div className="specialist-name">
      {this.getConsultantName(props)}</div><div className="specialist-designation">{this.getConsultantDesignation(props)}</div></div></div>);
    }
    treeTemplate(props) {
        return (<div id="waiting"><div id="waitdetails"><div id="waitlist">{props.Name}</div>
      <div id="waitcategory">{props.DepartmentName} - {props.Description}</div></div></div>);
    }
    onItemDrag(event) {
        if (this.scheduleObj.isAdaptive) {
            let classElement = this.scheduleObj.element.querySelector('.e-device-hover');
            if (classElement) {
                classElement.classList.remove('e-device-hover');
            }
            if (event.target.classList.contains('e-work-cells')) {
                addClass([event.target], 'e-device-hover');
            }
        }
        if (document.body.style.cursor === 'not-allowed') {
            document.body.style.cursor = '';
        }
        if (event.name === 'nodeDragging') {
            let dragElementIcon = document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
            for (let i = 0; i < dragElementIcon.length; i++) {
                dragElementIcon[i].style.display = 'none';
            }
        }
    }
    onActionBegin(event) {
        if (event.requestType === 'eventCreate' && this.isTreeItemDropped) {
            let treeViewdata = this.treeObj.fields.dataSource;
            const filteredPeople = treeViewdata.filter((item) => item.Id !== parseInt(this.draggedItemId, 10));
            this.treeObj.fields.dataSource = filteredPeople;
            let elements = document.querySelectorAll('.e-drag-item.treeview-external-drag');
            for (let i = 0; i < elements.length; i++) {
                remove(elements[i]);
            }
        }
    }
    onTreeDragStop(event) {
        let treeElement = closest(event.target, '.e-treeview');
        let classElement = this.scheduleObj.element.querySelector('.e-device-hover');
        if (classElement) {
            classElement.classList.remove('e-device-hover');
        }
        if (!treeElement) {
            event.cancel = true;
            let scheduleElement = closest(event.target, '.e-content-wrap');
            if (scheduleElement) {
                let treeviewData = this.treeObj.fields.dataSource;
                if (event.target.classList.contains('e-work-cells')) {
                    const filteredData = treeviewData.filter((item) => item.Id === parseInt(event.draggedNodeData.id, 10));
                    let cellData = this.scheduleObj.getCellDetails(event.target);
                    let resourceDetails = this.scheduleObj.getResourcesByIndex(cellData.groupIndex);
                    let eventData = {
                        Name: filteredData[0].Name,
                        StartTime: cellData.startTime,
                        EndTime: cellData.endTime,
                        IsAllDay: cellData.isAllDay,
                        Description: filteredData[0].Description,
                        DepartmentID: resourceDetails.resourceData.GroupId,
                        ConsultantID: resourceDetails.resourceData.Id
                    };
                    this.scheduleObj.openEditor(eventData, 'Add', true);
                    this.isTreeItemDropped = false;
                    this.draggedItemId = event.draggedNodeData.id;
                }
            }
        }
    }
    render() {
        return (<div className='schedule-control-section'>
        <div className='col-lg-12 control-section' style = {{display: 'flex', flexDirection: 'row'}}>
          <div className='control-wrapper drag-sample-wrapper'>
            <div className="schedule-container">
              <div className="title-container">
                <h1 className="title-text">Front-End Task</h1>
              </div>
              <ScheduleComponent ref={schedule => this.scheduleObj = schedule} cssClass='schedule-drag-drop' width='100%' height='650px' selectedDate={new Date(2020, 12, 5)} currentView='Week' resourceHeaderTemplate={this.resourceHeaderTemplate.bind(this)} eventSettings={{
            dataSource: this.data,
            fields: {
                subject: { title: 'Patient Name', name: 'Name' },
                startTime: { title: "From", name: "StartTime" },
                endTime: { title: "To", name: "EndTime" },
                description: { title: 'Reason', name: 'Description' }
            }
        }} group={{ enableCompactView: false, resources: ['Departments', 'Consultants'] }} actionBegin={this.onActionBegin.bind(this)} drag={this.onItemDrag.bind(this)}>
                <ResourcesDirective>
                  <ResourceDirective field='DepartmentID' title='Department' name='Departments' allowMultiple={true} dataSource={this.departmentData} textField='Text' idField='Id' colorField='Color'>
                  </ResourceDirective>
                  <ResourceDirective field='ConsultantID' title='Consultant' name='Consultants' allowMultiple={false} dataSource={this.consultantData} textField='Text' idField='Id' groupIDField="GroupId" colorField='Color'>
                  </ResourceDirective>
                </ResourcesDirective>
                <ViewsDirective>
                  <ViewDirective option= 'Week' />
                </ViewsDirective>
                <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop, Week]}/>
              </ScheduleComponent>
            </div>
          </div>
          <div className="treeview-container">
              <div className="title-container" >
                <h1 className="title-text">Waiting List</h1>
              </div>
              <div style = {{ borderColor: 'black', borderWidth: 2,margin: 8}}>
              <TreeViewComponent ref={tree => this.treeObj = tree} cssClass='treeview-external-drag' nodeTemplate={this.treeTemplate.bind(this)} fields={this.fields} nodeDragStop={this.onTreeDragStop.bind(this)} nodeDragging={this.onItemDrag.bind(this)} allowDragAndDrop={this.allowDragAndDrops}/>
              </div>
            </div>
        </div>   
      </div>);
    }
}

export default App;














