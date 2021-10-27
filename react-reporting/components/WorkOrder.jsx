import React, { Component } from "react";

export default class WorkOrder extends Component {
  constructor(props) {
    super(props);
    console.log("Contructor Called");

    this.state = {
      mechanics: [],
      shops: [],
      workOrders: []
    };

    console.log("====================================");
    console.log(this.state.workOrders);
    console.log("====================================");
    this.getData.bind(this);
    this.getName.bind(this);
  }

  //

  // Perform id->name look up
  getName(type, id) {
    let name;

    if (type === "mech") {
      this.state.mechanics.filter(i => {
        if (i._id == id) {
          name = i.mechanicName;
        }
      });
    } else if (type === "shop") {
      this.state.shops.filter(i => {
        if (i._id == id) {
          name = i.shopName;
        }
      });
    }
    return name;
  }

  getData() {
    fetch("/reporting")
      .then(res => res.json())
      .then(data => {
        this.setState({
          mechanics: data[0],
          shops: data[1],
          workOrders: data[2]
        });
      });
  }

  componentDidMount() {
    this.getData();
    console.log("Component Mounted");
  }

  render() {
    const workOrders = this.state.workOrders.map((wrkOrd, i) => {
      if (!wrkOrd.workDone) {
        const mechName = this.getName("mech", wrkOrd.mechanicID);
        const shopName = this.getName("shop", wrkOrd.shopID);

        return (
          <div key={i}>
            <h1 className="" style={{ textAlign: "center" }}>
              {shopName}
            </h1>
            <h2 className="" style={{ textAlign: "center" }}>
              {mechName}
            </h2>
            <p className="" style={{ textAlign: "center" }}>
              {wrkOrd.workTodo}
            </p>
            <h3 className="" style={{ textAlign: "center" }}>
              Date opened: {wrkOrd.dateOpened}
            </h3>
            <hr />
          </div>
        );
      }
    });

    return (
      <div>
        <button
          onClick={() => this.getData()}
          id="refresh"
          class="ui-button ui-corner-all ui-widget"
        >
          Refresh
        </button>
        <h1>Open Work Orders</h1>
        <hr />
        {workOrders}
      </div>
    );
  }
}
