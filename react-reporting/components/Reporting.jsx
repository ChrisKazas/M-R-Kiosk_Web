import React, { Component } from "react";
import WorkOrder from "./WorkOrder.jsx";

export default class Reporting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shops: [],
      mechanics: [],
      workOrders: [],

      numOfWorkOrds: 0
    };

    this.getData.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  //
  getData() {
    fetch("/reporting")
      .then(res => res.json())
      .then(data => {
        this.setState({
          mechanics: data[0],
          shops: data[1],
          workOrders: data[2],

          numOfWorkOrds: data[2].length
        });
      });
  }

  render() {
    const openWOS = this.state.workOrders.filter(wrkOrd => !wrkOrd.workDone);

    const numOfOpenWorkOrders = openWOS.length;
    const numWrkOrds = this.state.numOfWorkOrds;

    return (
      <div>
        <h1 className="text">Reporting</h1>
        <h2>Work Orders To Date: {numWrkOrds}</h2>
        <h2>Open Work Orders: {numOfOpenWorkOrders}</h2>
        <WorkOrder />
      </div>
    );
  }
}
