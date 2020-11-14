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
    width = 850,
    height = 600,
    cx = 350,
    cy = 300,
    r = 150,
    colors = ['red', 'blue', 'yellow', 'green'],
    labels = ['North', 'South', 'East', 'West'],
    lx = 670,
    ly = 220,
    enableLegend = true;

const defaultStorage = [data, width, height, cx, cy, r, colors, labels, lx, ly, enableLegend];

const svgContainer = document.querySelector(".svgChart__svgContainer");

window.onload = svgContainer.appendChild(
    pieChart(data, width, height, cx, cy, r, colors, labels, lx, ly, enableLegend)
);

function pieChart(data, width, height, cx, cy, r, colors, labels, lx, ly, enableLegend) {
    let svgns = "http://www.w3.org/2000/svg";

    let chart = document.createElementNS(svgns, "svg:svg");

    chart.setAttribute("width", width);
    chart.setAttribute("height", height);
    chart.setAttribute("viewBox", "0 0 " + width + " " + height);
    chart.setAttribute("xmlns", svgns);
    chart.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");


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
        // path.setAttribute("stroke", colors[i]); //border
        path.setAttribute("stroke-width", "1");
        chart.appendChild(path);

        // line

        let centralAngle = startangle + (endangle - startangle) / 2;
        let textLength = getWidthOfText(labels[i], "sans serif", 16);
        
        let [xl1, yl1, xl2, yl2] = calcCoord(cx, cy, r, centralAngle, centralAngle, 0.7, 2);
        let xl3 = (centralAngle < Math.PI) ? xl2 + textLength : xl2 - textLength;
        let yl3 = yl2;

        let points = xl1 + "," + yl1 + " " + xl2 + "," + yl2 + " " + xl3 + "," + yl3;

        let polyline = document.createElementNS(svgns, "polyline");
        
        polyline.setAttribute("points", points);
        polyline.setAttribute("stroke-width", "2");
        polyline.setAttribute("stroke", "#323234");
        polyline.setAttribute("stroke-miterlimit", "0");
        polyline.setAttribute("fill", "none");

        let polylineLength = getPolylineLength(polyline);

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

        let pathForText = document.createElementNS(svgns, "path");
        pathForText.setAttribute("id", `p${i}`);
        pathForText.setAttribute("d", `m${llx},${lly} h0`);
        chart.appendChild(pathForText);

        let textInputEffect = createAnimation("d", `lineStart${i}.end`, `m${llx},${lly} h100`, "1s", `textInput${i}`);
        pathForText.appendChild(textInputEffect);

        let textHide = createAnimation("d", `lineRemove${i}.begin`, `m${llx},${lly} h0`, "0.5s", `textOut${i}`);
        pathForText.appendChild(textHide);

        let textForceHide = createAnimation("d", `sectorAnimEnd${i}.end`, `m${llx},${lly} h0`, "0.1s", `textOut${i}`);
        pathForText.appendChild(textForceHide);

        let lineLabel = document.createElementNS(svgns, "text");
        lineLabel.setAttribute("font-family", "sans-serif");
        lineLabel.setAttribute("font-size", "16");
        lineLabel.setAttribute("font-weight", "600");
        lineLabel.setAttribute("fill", "#323234");
        chart.appendChild(lineLabel);

        let textpath = document.createElementNS(svgns, "textPath");
        textpath.setAttribute("href", `#p${i}`);
        textpath.setAttribute("xlink:href", `#p${i}`);
        lineLabel.appendChild(textpath);

        textpath.appendChild(document.createTextNode(labels[i]));

        // Legend

        if (enableLegend) {

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
    }
    return chart;
}

function getWidthOfText (txt, fontname, fontsize) {
    if (getWidthOfText.c === undefined) {
        getWidthOfText.c = document.createElement('canvas');
        getWidthOfText.ctx = getWidthOfText.c.getContext('2d');
    }
    let fontspec = fontsize + ' ' + fontname;
    if (getWidthOfText.ctx.font !== fontspec) getWidthOfText.ctx.font = fontspec;
    return getWidthOfText.ctx.measureText(txt).width * 1.8;
}

function calcCoord(cx, cy, r, startangle, endangle, coefIncr = 1, coefSecond = 1) {
    let x1 = cx + coefIncr * r * Math.sin(startangle),
        y1 = cy - coefIncr * r * Math.cos(startangle),
        x2 = cx + coefIncr * coefSecond * r * Math.sin(endangle),
        y2 = cy - coefIncr * coefSecond * r * Math.cos(endangle);
    return [x1, y1, x2, y2];
}

function calculateD(cx, cy, x1, y1, x2, y2, r, big, coefIncr = 1) {
    x2 = (Math.abs(x1 - x2) < 0.01) ? x2 - 0.01 : x2;
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

function getPolylineLength(polylineElement){
    function dis(p,q){
        return Math.sqrt((p.x-q.x)*(p.x-q.x) + (p.y-q.y)*(p.y-q.y));
    }
    var ps = polylineElement.points, n = ps.numberOfItems, len=0;
    for(var i=1; i<n; i++){
        len += dis(ps.getItem(i-1),ps.getItem(i));
    }
    return len;
}

// Pie chart menu

const newChartButton = document.querySelector(".button-newChart");
const editButton = document.querySelector(".button-edit");
const regButtonBox = document.querySelector(".regButtonsBox");
const cancelButton = document.querySelector(".button-cancel");
const doneButton = document.querySelector(".button-done");
const menuField = document.querySelector(".inputList");
const title = document.querySelector(".svgChart__title");

const inputField = document.createElement("li");
    inputField.setAttribute("draggable", true);
    inputField.classList.add("inputList__inputField", "inputField");
const inputZone = document.createElement("div");
    inputZone.classList.add("inputField__inputZone", "inputZone");

inputField.appendChild(inputZone);
    
const inputText = document.createElement("input");
    inputText.classList.add("inputZone__inputText");
    inputText.setAttribute("type", "text");
    inputText.setAttribute("placeholder", "sector label, 100%");

inputZone.appendChild(inputText);

const inputColor = document.createElement("input");
    inputColor.classList.add("inputZone__inputColor");
    inputColor.setAttribute("type", "color");

inputZone.appendChild(inputColor);

const plusButton = document.createElement("button");
    plusButton.classList.add("inputField__plusButton", "button", "button-round");
    plusButton.setAttribute("type", "button");
    plusButton.innerText = "+";

inputField.appendChild(plusButton);

newChartButton.onclick = (e) => {
    title.innerText = "Random chart";
    title.contentEditable = true;
    removeAllChildNodes(menuField);
    menuField.appendChild(inputField);
    inputField.querySelector('.inputZone__inputColor').value = getRandomColor();
    regButtonBox.style.display = 'flex';
    menuField.style.display = "block";

    // in case of redo chart

    inputField.querySelector('.inputZone__inputText').value = "";
    const minusSelector = inputField.querySelector('.inputField__minusButton');
    if (minusSelector) {
        minusSelector.classList.replace("inputField__minusButton", "inputField__plusButton");
        minusSelector.innerText = "+";
    }
    clickRegister();
    inputRegister();
    applyNewPieChart();
};

cancelButton.onclick = () => {
    regButtonBox.style.display = "none";
    removeAllChildNodes(menuField);
    removeAllChildNodes(svgContainer);
    svgContainer.appendChild(pieChart(...defaultStorage));
    title.innerText = "Random chart";
    title.contentEditable = false;
};

doneButton.onclick = () => {
    if (checkAllInputs()) {
        menuField.style.display = "none";
        regButtonBox.style.display = "none";
        editButton.style.display = "block";
        title.contentEditable = false;
        applyNewPieChart(true);  
    }
};

doneButton.onmousedown = () => {
    if (!checkAllInputs()) {
        doneButton.style.borderColor = "#FF4747";  
    }
};

doneButton.onmouseup = () => {
    if (!checkAllInputs()) {
        doneButton.style.borderColor = "#00FF00";  
    }
};

editButton.onclick = () => {
    menuField.style.display = "block";
    regButtonBox.style.display = "flex";
    editButton.style.display = "none";
    title.contentEditable = true;
    applyNewPieChart(false);
};

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function clickRegister() {
    const addButtons = document.getElementsByClassName("inputField__plusButton");
    const removeButtons = document.getElementsByClassName("inputField__minusButton");
    let n = 0;
    for (let i = 0; i < addButtons.length; i++) {
        addButtons[i].onclick = (e) => {
            e.preventDefault();
            let newInput = menuField.lastElementChild.cloneNode(true);
            menuField.appendChild(newInput);
            newInput.querySelector('.inputZone__inputColor').value = getRandomColor();
            newInput.querySelector('.inputZone__inputText').value = "";
            checkColor();
            if (n >= 1) {
                addButtons[n-1].classList.replace("inputField__plusButton", "inputField__minusButton");
            }
            clickRegister();
            inputRegister();
            insertPercent();
            applyNewPieChart();
            dragAndDrop();
        };
        n++;
    }
    for (let i = 0; i < removeButtons.length; i++) {
        removeButtons[i].innerText = "-";
        removeButtons[i].onclick = (e) => {
            e.target.parentElement.remove();
            insertPercent();
            applyNewPieChart();
        };
    }
}

function changeMinusPlusBtn() {
    const buttons = menuField.querySelectorAll(".button");
    buttons.forEach((item, i) => {
        item.classList.replace("inputField__plusButton", "inputField__minusButton");
        item.innerText = "-";
    });
    buttons[buttons.length - 1].classList.replace("inputField__minusButton", "inputField__plusButton");
    buttons[buttons.length - 1].innerText = "+";
}

function inputRegister() {
    const allColorInputs = menuField.querySelectorAll('.inputZone__inputColor');
    const allTextInputs = menuField.querySelectorAll('.inputZone__inputText');
    
    for (let i = 0; i < allColorInputs.length; i++) {
        
        allColorInputs[i].onchange = () => {
            allColorInputs[i].setCustomValidity("");
            checkColor();
            applyNewPieChart(); 
        };
        allTextInputs[i].onblur = () => {
            checkInput();
            insertPercent();
            applyNewPieChart(); 
        };
    }
}

// Validate input

// Check color

function checkColor() {
    const allColorInputs = menuField.getElementsByClassName('inputZone__inputColor');
    if (allColorInputs.length > 1) {
        const colorArr = [];
        for (let i = 0; i < allColorInputs.length; i++) {
            let color = allColorInputs[i].value;
            if (colorArr.includes(color)) {
                allColorInputs[i].setCustomValidity("change color");
                allColorInputs[colorArr.findIndex(item => {return item == color;})].setCustomValidity("change color");
            } else {
                allColorInputs[i].setCustomValidity("");
            }
            colorArr.push(color);
        }
    }
}

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Check input sector name and %

function checkInput() {
    const allTextInputs = menuField.querySelectorAll(".inputZone__inputText");
    allTextInputs.forEach(input => {
        let patt = /^[A-Za-zА-Яа-я0-9 \\-\\.]{1,10}, ?([1-9](\d)?|([0-9](\d)?\.\d{1,2}))%$/; 
        if (!patt.test(input.value) && input.value != "") {
            input.setCustomValidity("Correct input according tamplate");
            input.oninput = checkInput;
        } else {
            input.setCustomValidity("");
            input.oninput = false;
        }
    });
}

function insertPercent() {
    const allTextInputs = menuField.querySelectorAll(".inputZone__inputText");
    const percent = [];
    allTextInputs.forEach(input => {
        if (input.value && input.validity.valid) {
            percent.push(parsePercent(input.value));
        }
    });
    if ((allTextInputs.length >= 1) && (allTextInputs.length > percent.length)) {
        const sumInputPercent = percent.length == 0 ? 0 : percent.reduce((a, b) => a + b);
        const restPecent = Math.floor(((100 - sumInputPercent) / (allTextInputs.length - percent.length))*10)/10;
        allTextInputs.forEach(input => {
            input.setAttribute("placeholder", `sector label, ${restPecent}%`);
        });
    }
    
}

function parsePercent(str) {
    let patt = /\,(.+)%/;
    let slice = patt.exec(str)[1].trim();
    return parseFloat(slice);
}

function parseLabel(str) {
    let patt = /(.+)\,/;
    let slice = patt.exec(str)[1];
    return slice;
}

function applyNewPieChart(enableLegend) {
    const items = menuField.querySelectorAll(".inputZone"),
          textInputs = menuField.querySelectorAll(".inputZone__inputText"),
          colorInputs = menuField.querySelectorAll(".inputZone__inputColor");
    data = [];
    colors = [];
    labels = [];
    if (checkAllInputs()) {
        items.forEach((item, i) => {
        let dataItem = textInputs[i].value ? parsePercent(textInputs[i].value) : parsePercent(textInputs[i].placeholder);
        let colorItem = colorInputs[i].value;
        let labeItem = textInputs[i].value ? parseLabel(textInputs[i].value) : "sector label";
        data.push(dataItem);
        colors.push(colorItem);
        labels.push(labeItem);
        });
        removeAllChildNodes(svgContainer);
        svgContainer.appendChild(pieChart(data, width, height, cx, cy, r, colors, labels, lx, ly, enableLegend));
    }
}

function checkAllInputs() {
    checkAllPercent();
    const textInputs = menuField.querySelectorAll(".inputZone__inputText"),
          colorInputs = menuField.querySelectorAll(".inputZone__inputColor");
    let allInputsValid = true;
    for (let i = 0; i < textInputs.length; i++) {
        if (!textInputs[i].validity.valid || !colorInputs[i].validity.valid) {
            allInputsValid = false;
        }
    }
    return allInputsValid;
}

function checkAllPercent() {
    const textInputs = menuField.querySelectorAll(".inputZone__inputText");
    let percentArr = [];
    let totalPercent = 0;
    let belowZeroValues = false;
    textInputs.forEach(input => {
        console.log(input.validity.valid)
        if (input.value && input.validity.valid) {
            percentArr.push(parsePercent(input.value))
        } else if (!input.value) {
            percentArr.push(parsePercent(input.placeholder))
            if (parsePercent(input.placeholder) < 0) {
                belowZeroValues = true
            }
        }
    })
    if (percentArr.length > 0) {
        totalPercent = Math.ceil(percentArr.reduce((a, b) => a + b));
    }
    textInputs.forEach(input => {
        if (((percentArr.length == textInputs.length) && totalPercent != 100) || belowZeroValues) {
            if (input.value) {
                input.setCustomValidity("Total percent sum should be 100%");
            }   
        } 
    })
    console.log(percentArr, totalPercent, (percentArr.length == textInputs.length))
}

// Drag and drop li

function dragAndDrop() {
    const draggables = document.querySelectorAll(".inputField");

    draggables.forEach(draggable => {
        draggable.addEventListener("dragstart", () => {
            draggable.classList.add("dragging");
        });
        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging");
            changeMinusPlusBtn();
            applyNewPieChart();
        });
    });

    menuField.addEventListener("dragover", e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(menuField, e.clientY);
        const draggable = document.querySelector(".dragging");
        if (afterElement == null) {
            menuField.appendChild(draggable);
        } else {
            menuField.insertBefore(draggable, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".inputField:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

