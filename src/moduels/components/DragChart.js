import "whatwg-fetch";
import React, { Component } from "react";
import * as d3 from "../../libraries/d3Library/d3v4.js";
import { Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
class Dragchart extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();
    let averageDataOfPastDays = [];
    let averageDataOfFutureDays = [
      {
        date: this.numberOfDay(
          thisYear,
          thisMonth - 1,
          this.daysInMonth(thisMonth - 1, thisYear)
        ),
        debt:
          10 +
          this.numberOfDay(
            thisYear,
            thisMonth - 1,
            this.daysInMonth(thisMonth - 1, thisYear)
          ) *
            0.3
      }
    ];

    // set past 3months default values
    for (
      let pastNumberOfDate = this.numberOfDay(thisYear, thisMonth - 3, 1);
      pastNumberOfDate < this.numberOfDay(thisYear, thisMonth, 1);
      pastNumberOfDate++
    ) {
      averageDataOfPastDays.push({
        date: pastNumberOfDate,
        debt: 10 + pastNumberOfDate * 0.3
      });
    }

    // set future 3 months default values;

    for (
      let futureNumberOfDate = this.numberOfDay(thisYear, thisMonth, 1);
      futureNumberOfDate < this.numberOfDay(thisYear, thisMonth + 3, 1);
      futureNumberOfDate++
    ) {
      averageDataOfFutureDays.push({
        date: futureNumberOfDate,
        debt: 0
      });
    }

    this.state = {
      debutData: {},
      showErrorModal: false,
      averageData: averageDataOfFutureDays,
      pastAverageData: averageDataOfPastDays,
      showButtonFlag: false,
      thisYear: thisYear,
      thisMonth: thisMonth,
      guessGraphData: {},
      showAverageGraph: false,
      dragwRangeInfo: {},
      seeAverageButtonState: true
    };
  }

  componentDidMount() {
    const { thisYear, thisMonth, pastAverageData, averageData } = this.state;

    let ƒ = d3.f;

    let sel = d3.select("#drag").html("");

    let dragwRangeInfo = d3.conventions({
      parentSel: sel,
      totalWidth: sel.node().offsetWidth,
      height: 400,
      margin: { left: 50, right: 50, top: 30, bottom: 30 }
    });
    this.setState({ dragwRangeInfo });

    dragwRangeInfo.svg.append("rect").at({
      width: dragwRangeInfo.width,
      height: dragwRangeInfo.height,
      opacity: 0
    });
    dragwRangeInfo.x.domain([
      this.numberOfDay(
        thisYear,
        thisMonth - 3,
        this.daysInMonth(thisMonth - 3, thisYear)
      ),
      this.numberOfDay(
        thisYear,
        thisMonth + 2,
        this.daysInMonth(thisMonth + 2, thisYear)
      )
    ]);

    dragwRangeInfo.y.domain([0, 100]);

    dragwRangeInfo.xAxis.ticks(6).tickFormat(ƒ());
    dragwRangeInfo.yAxis.ticks(5).tickFormat(debtValue => "$" + debtValue);

    let area = d3
      .area()
      .x(ƒ("date", dragwRangeInfo.x))
      .y0(ƒ("debt", dragwRangeInfo.y))
      .y1(dragwRangeInfo.height);
    let line = d3
      .line()
      .x(ƒ("date", dragwRangeInfo.x))
      .y(ƒ("debt", dragwRangeInfo.y));

    let clipRect = dragwRangeInfo.svg
      .append("clipPath#clip")
      .append("rect")
      .at({
        width:
          dragwRangeInfo.x(
            this.numberOfDay(
              thisYear,
              thisMonth - 1,
              this.daysInMonth(thisMonth - 1, thisYear)
            )
          ) - 2,
        height: dragwRangeInfo.height
      });

    let correctSel = dragwRangeInfo.svg
      .append("g")
      .attr("clip-path", "url(#clip)");
    correctSel.append("path.area").at({ d: area(pastAverageData) });
    correctSel.append("path.line").at({ d: line(pastAverageData) });

    let correctSelr = dragwRangeInfo.svg
      .append("g")
      .attr("clip-path", "url(#clip)");
    this.setState({ guessGraphData: correctSelr });

    let userGraphDataSel = dragwRangeInfo.svg.append("path.your-line");
    dragwRangeInfo.drawAxis();

    const that = this;
    let userGraphData = averageData.map(function(d) {
      return {
        date: d.date,
        debt: d.debt,
        defined:
          d.date ===
          that.numberOfDay(
            thisYear,
            thisMonth - 1,
            that.daysInMonth(thisMonth - 1, thisYear)
          )
            ? true
            : 0
      };
    });

    let completed = false;
    let drag = d3.drag().on("drag", function() {
      let pos = d3.mouse(this);
      let date = that.clamp(
        that.numberOfDay(thisYear, thisMonth, 1),
        that.numberOfDay(
          thisYear,
          thisMonth + 2,
          that.daysInMonth(thisMonth + 2, thisYear)
        ),
        dragwRangeInfo.x.invert(pos[0])
      );
      let debt = that.clamp(
        0,
        dragwRangeInfo.y.domain()[1],
        dragwRangeInfo.y.invert(pos[1])
      );

      for (let i = 0; i < userGraphData.length; i++) {
        const d = userGraphData[i];
        if (Math.abs(d.date - date) < 0.5) {
          d.debt = debt;
          d.defined = true;
          break;
        }
        if (!d.defined) {
          d.defined = true;
          d.debt = userGraphData[i - 1] ? userGraphData[i - 1].debt : 0;
        }
      }

      userGraphDataSel.at({ d: line.defined(ƒ("defined"))(userGraphData) });

      if (!completed && d3.mean(userGraphData, ƒ("defined")) === 1) {
        that.setState({ debutData: userGraphData });
        completed = true;
        clipRect
          .transition()
          .duration(5000)
          .attr(
            "width",
            dragwRangeInfo.x(
              that.numberOfDay(
                thisYear,
                thisMonth + 2,
                that.daysInMonth(thisMonth + 2, thisYear)
              )
            )
          );
      }
    });

    dragwRangeInfo.svg.call(drag);
  }

  clamp = (comparisonValue1, comparisonValue2, comparisonValue3) => {
    return Math.max(
      comparisonValue1,
      Math.min(comparisonValue2, comparisonValue3)
    );
  };

  saveDebutValue = debutValue => {
    let idToken = localStorage.getItem("CognitoIdentityServiceProvider.7m215sihsv1h9juaej206lempi.lambda-test.idToken");
    let requestData = {
      data: debutValue
    };
    axios({
      method: "post",
      url:
        "https://u2qgvn2qw7.execute-api.us-west-2.amazonaws.com/dev/getPredictionDev/test",
      header:{"Authorization" : idToken },
      data: requestData
    })
      .then(res => {
        alert("Your process has been successfully completed.!!!");
        let averages = res.data.body;
        localStorage.setItem("averages", JSON.stringify(averages));
        this.setState({ seeAverageButtonState: false });
      })
      .catch(err => {
        alert(err);
      });
  };

  onSubmit = () => {
    if (this.state.debutData)
      if (Object.keys(this.state.debutData).length > 0) {
        this.saveDebutValue(this.state.debutData);
      } else {
        this.setState({ showErrorModal: true });
      }
  };

  handleDismiss = () => {
    this.setState({ showErrorModal: false });
  };

  getAverage = () => {
    let avrgs = [];
    let averages = JSON.parse(localStorage.getItem("averages"));
    Object.keys(averages).forEach(key => {
      avrgs.push({
        date: parseInt(key, 10),
        debt: averages[key]
      });
    });
    this.setState({ averageData: avrgs, showAverageGraph: true });
  };

  deleteDb = () => {
    let idToken = localStorage.getItem("CognitoIdentityServiceProvider.7m215sihsv1h9juaej206lempi.lambda-test.idToken");
    const headers = {
		'Authorization': idToken
	}
    axios
      .delete(
        "https://30xqj3oo9d.execute-api.us-west-2.amazonaws.com/dev/deleteDBdev", {headers}
	
      )
      .then(res => {
        let status = res.data;
        console.log(status);

        if (status.status === "success") {
          alert("Successfully the DB contents......");
        }
      })
      .catch(err => {
        alert(err);
      });
  };

  daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  numberOfDay = (year, month, day) => {
    let date = new Date(year, month, day);
    return Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / 86400000);
  };

  drawAverageGraphRender(averageData) {
    d3.select(".arear").remove();
    d3.select(".liner").remove();
    let { dragwRangeInfo, guessGraphData } = this.state;

    let ƒ = d3.f;

    const arear = d3
      .area()
      .x(ƒ("date", dragwRangeInfo.x))
      .y0(ƒ("debt", dragwRangeInfo.y))
      .y1(dragwRangeInfo.height);

    const liner = d3
      .area()
      .x(ƒ("date", dragwRangeInfo.x))
      .y(ƒ("debt", dragwRangeInfo.y));

    guessGraphData.append("path.arear").at({ d: arear(averageData) });
    guessGraphData.append("path.liner").at({ d: liner(averageData) });
  }

  render() {
    const { seeAverageButtonState, averageData } = this.state;
    return (
      <div className="mainWidget">
        {this.state.showErrorModal === true && (
          <Alert bsStyle="danger">
            <strong>Please draw the Prediction graph</strong>
            <Button
              bsStyle="danger"
              className="error-message"
              onClick={this.handleDismiss}
            >
              Close
            </Button>
          </Alert>
        )}

        <div>
          {/* <p>Predict the Market</p> */}
          <Button
            bsStyle="primary"
            className="submit-prediction"
            onClick={this.onSubmit}
          >
            Submit Prediction
          </Button>
          <Button
            bsStyle="primary"
            className="see-average"
            disabled={seeAverageButtonState}
            onClick={this.getAverage}
          >
            See Average
          </Button>
          <Button bsStyle="danger" className="clear-db" onClick={this.deleteDb}>
            Delete All Data
          </Button>
          <div id="drag" />
        </div>

        {this.state.showAverageGraph === true &&
          this.drawAverageGraphRender(averageData)}
      </div>
    );
  }
}

export default Dragchart;
