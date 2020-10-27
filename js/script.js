/* Creates <svg> and draw pie-chart

 Arguments:
 data: array of digits, one per sector;
 width, height: sizes in px;
 cx, cy, r: centre coordinates and radius;
 colors: array of colors (HTML) per sector;
 labels: array of entries for legend, one per sector;
 lx, ly: legend left up corner coordinates.


*/

let data = [12, 23, 34, 45],
    width = 800,
    height = 600,
    cx = 300,
    cy = 300,
    r = 150,
    colors = ['red', 'blue', 'yellow', 'green'],
    labels = ['Север', 'Юг', 'Восток', 'Запад'],
    lx = 600,
    ly = 220;

window.onload = document.body.appendChild(
    pieChart(data, width, height, cx, cy, r, colors, labels, lx, ly)
);

function pieChart(data, width, height, cx, cy, r, colors, labels, lx, ly) {
    let svgns = "http://www.w3.org/2000/svg";

    let chart = document.createElementNS(svgns, "svg:svg");

    chart.setAttribute("width", width);
    chart.setAttribute("height", height);
    chart.setAttribute("viewBox", "0 0 " + width + " " + height);

    let total = 0;
    for (let i = 0; i < data.length; i++) total += data[i];

    let angles = [];
    for (let i = 0; i < data.length; i++) angles[i] = data[i]/total*Math.PI*2;

    let startangle = 0;
    
    for (let i = 0; i < data.length; i++) {
        let endangle = startangle + angles[i];

        let [x1, y1, x2, y2] = calcCoord(cx, cy, r, startangle, endangle);

        let big = 0;
        if (endangle - startangle > Math.PI) big = 1;

        let path = document.createElementNS(svgns, "path");

        let d = calculateD(cx, cy, x1, y1, x2, y2, r, big);

        path.setAttribute("d", d);
        path.setAttribute("fill", colors[i]);
        // path.setAttribute("stroke", colors[i]);
        path.setAttribute("stroke-width", "1");
        chart.appendChild(path);

        // line

        let modR = r * 0.5;

        let centralAngle = startangle + (endangle - startangle) / 2;
        let textLength = labels[i].length * 10;
        
        let [xl1, yl1, xl2, yl2] = calcCoord(cx, cy, r, centralAngle, centralAngle, 0.7, 2);
        let xl3 = (centralAngle < Math.PI) ? xl2 + textLength : xl2 - textLength;
        let yl3 = yl2;

        let points = xl1 + "," + yl1 + " " + xl2 + "," + yl2 + " " + xl3 + "," + yl3;

        let polyline = document.createElementNS(svgns, "polyline");
        
        polyline.setAttribute("points", points);
        polyline.setAttribute("stroke-width", "1");
        polyline.setAttribute("stroke", "black");
        polyline.setAttribute("stroke-miterlimit", "0");
        polyline.setAttribute("fill", "none");

        let polylineLength = polyline.getTotalLength();

        polyline.setAttribute("stroke-dasharray", polylineLength + ' ' + polylineLength);
        polyline.setAttribute("stroke-dashoffset", polylineLength);

        chart.appendChild(polyline);


        // animate sector

        let coefIncr = 1.2;
        
        [x1, y1, x2, y2] = calcCoord(cx, cy, r, startangle, endangle, coefIncr);

        let animD = calculateD(cx, cy, x1, y1, x2, y2, r, big, coefIncr);

        let increaseSector = createAnimation("d", "mouseenter", animD, "1s", `sectorAnimStart${i}`);
        path.appendChild(increaseSector);

        let decreaseSector = createAnimation("d", "mouseleave", d, "1s", `sectorAnimEnd${i}`);
        path.appendChild(decreaseSector);

        startangle = endangle;

        // animate polyline

        let showLine = createAnimation("stroke-dashoffset", `sectorAnimStart${i}.begin`, "0", "1s", `lineStart${i}`);
        polyline.appendChild(showLine);

        let removeLine = createAnimation("stroke-dashoffset", `sectorAnimEnd${i}.begin`, polylineLength, "0.3s", `lineRemove${i}`);
        polyline.appendChild(removeLine);

        // Line subscription

        let llx = (centralAngle < Math.PI) ? xl2 + 5 : xl3;
        let lly = yl2 - 5;

        let lineLabel = document.createElementNS(svgns, "text");
        lineLabel.setAttribute("x", llx);
        lineLabel.setAttribute("y", lly);
        lineLabel.setAttribute("font-family", "sans-serif");
        lineLabel.setAttribute("font-size", "16");
        lineLabel.setAttribute("opacity", "0");
        lineLabel.appendChild(document.createTextNode(labels[i]));
        chart.appendChild(lineLabel);

        let lineLabelAnimation = createAnimation("opacity", `sectorAnimStart${i}.end`, "1", "0.5s", `labelShow${i}`);
        lineLabel.appendChild(lineLabelAnimation);

        let lineLabelHide = createAnimation("opacity", `lineRemove${i}.begin`, "0", "0.1s", `labelHide${i}`);
        lineLabel.appendChild(lineLabelHide);

        let lineLabelForceHide = createAnimation("opacity", `sectorAnimEnd${i}.end`, "0", "0.1s", `labelHide${i}`);
        lineLabel.appendChild(lineLabelForceHide);

        // Legend

        // small square identifier

        let icon = document.createElementNS(svgns, "rect");
        icon.setAttribute("x", lx);
        icon.setAttribute("y", ly + 30*i);
        icon.setAttribute("width", 20);
        icon.setAttribute("height", 20);
        icon.setAttribute("fill", colors[i]);
        icon.setAttribute("stroke", "black");
        chart.appendChild(icon);

        // label

        let label = document.createElementNS(svgns, "text");
        label.setAttribute("x", lx + 30);
        label.setAttribute("y", ly + 30*i + 18);

        // style with css later

        label.setAttribute("font-family", "sans-serif");
        label.setAttribute("font-size", "16");

        label.appendChild(document.createTextNode(labels[i]));
        chart.appendChild(label);
    }
    return chart;
}

function calcCoord(cx, cy, r, startangle, endangle, coefIncr = 1, coefSecond = 1) {
    let x1 = cx + coefIncr * r * Math.sin(startangle),
        y1 = cy - coefIncr * r * Math.cos(startangle),
        x2 = cx + coefIncr * coefSecond * r * Math.sin(endangle),
        y2 = cy - coefIncr * coefSecond * r * Math.cos(endangle);
    return [x1, y1, x2, y2];
}

function calculateD(cx, cy, x1, y1, x2, y2, r, big, coefIncr = 1) {
    return "M " + cx + "," + cy + " L " + x1 + "," + y1 + " A " + coefIncr * r + "," + coefIncr * r + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";
}

function createAnimation(attr, trigger, endpoint, duration, id) {
    let svgns = "http://www.w3.org/2000/svg";
    let animate = document.createElementNS(svgns, "animate");
    animate.setAttribute("id", id);
    animate.setAttribute("attributeName", attr);
    animate.setAttribute("dur", duration);
    animate.setAttribute("to", endpoint);
    animate.setAttribute("begin", trigger);
    animate.setAttribute("fill", "freeze");
    return animate;
}



