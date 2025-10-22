function appendValue(value) {
    document.getElementById("display").value += value;
}

function clearDisplay() {
    document.getElementById("display").value = "";
}

function deleteLast() {
    let display = document.getElementById("display").value;
    document.getElementById("display").value = display.slice(0, -1);
}

function calculateResult() {
    let expression = document.getElementById("display").value;
    try {
        document.getElementById("display").value = eval(expression);
    } catch {
        document.getElementById("display").value = "Error";
    }
}
