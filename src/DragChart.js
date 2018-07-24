import React, { Component } from 'react';
import * as d3 from './d3v4.js';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

class Dragchart extends Component {
  componentDidMount() {
    let data = [
      { year: 2001, debt: 31.4 },
      { year: 2002, debt: 32.6 },
      { year: 2003, debt: 34.5 },
      { year: 2004, debt: 35.5 },
      { year: 2005, debt: 35.6 },
      { year: 2006, debt: 35.3 },
      { year: 2007, debt: 35.2 },
      { year: 2008, debt: 39.3 },
      { year: 2009, debt: 52.3 },
      { year: 2010, debt: 60.9 },
      { year: 2011, debt: 65.9 },
      { year: 2012, debt: 70.4 },
      { year: 2013, debt: 72.6 },
      { year: 2014, debt: 74.4 },
      { year: 2015, debt: 73.6 },
    ];

    let datar = [
      { year: 2015, debt: 73.6 },
      { year: 2016, debt: 60.9 },
      { year: 2017, debt: 65.9 },
      { year: 2018, debt: 70.4 },
      { year: 2019, debt: 72.6 },
      { year: 2020, debt: 74.4 },
      { year: 2021, debt: 73.6 },
      { year: 2022, debt: 60.9 },
      { year: 2023, debt: 65.9 },
      { year: 2024, debt: 70.4 },
      { year: 2025, debt: 72.6 }
    ];

    let ƒ = d3.f;

    let sel = d3.select('#drag').html('');
    let c = d3.conventions({
      parentSel: sel,
      totalWidth: sel.node().offsetWidth,
      height: 400,
      margin: { left: 50, right: 50, top: 30, bottom: 30 }
    });

    c.svg.append('rect').at({ width: c.width, height: c.height, opacity: 0 });

    c.x.domain([2001, 2025]);
    c.y.domain([0, 100]);

    c.xAxis.ticks(6).tickFormat(ƒ());
    c.yAxis.ticks(5).tickFormat(d => '$' + d);

    let area = d3
      .area()
      .x(ƒ('year', c.x))
      .y0(ƒ('debt', c.y))
      .y1(c.height);
    let line = d3
      .area()
      .x(ƒ('year', c.x))
      .y(ƒ('debt', c.y));

    let clipRect = c.svg
      .append('clipPath#clip')
      .append('rect')
      .at({ width: c.x(2015) - 2, height: c.height});

    let arear = d3
      .area()
      .x(ƒ('year', c.x))
      .y0(ƒ('debt', c.y))
      .y1(c.height);

    let liner = d3
      .area()
      .x(ƒ('year', c.x))
      .y(ƒ('debt', c.y));

    let correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)');

    correctSel.append('path.area').at({ d: area(data) });
    correctSel.append('path.line').at({ d: line(data) });

    let correctSelr = c.svg.append('g').attr('clip-path', 'url(#clip)');

    correctSelr.append('path.arear').at({ d: arear(datar)});
    correctSelr.append('path.liner').at({ d: liner(datar)});

    let yourDataSel = c.svg.append('path.your-line');
    c.drawAxis();

    let yourData = datar
      .map(function(d) {
        return { year: d.year, debt: d.debt, defined: 0 };
      })
      .filter(function(d) {
        if (d.year === 2015) d.defined = true;
        return d.year >= 2015;
      });

    let completed = false;

    let drag = d3.drag().on('drag', function() {
      let pos = d3.mouse(this);
      let year = clamp(2016, 2025, c.x.invert(pos[0]));
      let debt = clamp(0, c.y.domain()[1], c.y.invert(pos[1]));

      yourData.forEach(function(d) {
        if (Math.abs(d.year - year) < 0.5) {
          d.debt = debt;
          d.defined = true;
        }
      });

      yourDataSel.at({ d: line.defined(ƒ('defined'))(yourData) });

      if (!completed && d3.mean(yourData, ƒ('defined')) === 1) {
        completed = true;
        clipRect
          .transition()
          .duration(5000)
          .attr('width', c.x(2025));
      }
    });

    c.svg.call(drag);
    function clamp(a, b, c) {
      return Math.max(a, Math.min(b, c));
    }
  }

  render() {
  return (
      <div className="mainWidget">
        <p>Predict the Market</p>
        <Button bsStyle='primary' className='submit-prediction'>Submit Prediction</Button>
        <Button bsStyle='primary' className='see-average'>See Average</Button>
        <div id="drag"></div>
      </div>
    );
  }
}

export default Dragchart;
