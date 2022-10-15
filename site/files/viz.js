var options = {
    chart: {
        height: 350,
        type: 'bar',
    },
    dataLabels: {
        enabled: true,
        position: "top",
        dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.25
        }
    },
    fill: {
        colors: [function ({ value, seriesIndex, w }) {
            if (value < 51) {
                return '#00e400'
            } else if (value >= 51 && value < 101) {
                return '#FFFF00'
            } else if (value >= 101 && value < 151) {
                return '#ff7e00'
            } else if (value >= 151 && value < 201) {
                return '#f00'
            } else if (value >= 201 && value < 301) {
                return '#8f3f97'
            } else {
                return '#7e0023'
            }
        }],
        dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.5
        },
    },
    series: [],
    title: {
        text: "Air Quality Index in Selected Cities",
        floating: 0,
        offsetY: 320,
        align: "center",
        style: {
            color: "#444"
        }
    },
    noData: {
        text: 'Click an area on the map to load AQI data...'
    },
    xaxis: {
        categories: cityarray,

        position: "top",
        labels: {
            offsetY: -18
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
    },
}

var chart = new ApexCharts(
    document.querySelector("#chart"),
    options
);

chart.render();


var options = {
    chart: {
        height: 350,
        type: 'donut',
    },
    series: [{
        name: 'AQI',
        data: [aqitop5]
      }],
    dataLabels: {
        enabled: false
    },
    fill: {
        colors: [function ({ value, seriesIndex, w }) {
            if (value < 51) {
                return '#00e400'
            } else if (value >= 51 && value < 101) {
                return '#FFFF00'
            } else if (value >= 101 && value < 151) {
                return '#ff7e00'
            } else if (value >= 151 && value < 201) {
                return '#FFFFFF'
            } else if (value >= 201 && value < 301) {
                return '#FFFFFF'
            } else {
                return '#FFFFFF'
            }
        }],
        dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.5
        },
    },
    legend: {
        position: 'right',
        offsetY: 0,
        height: 230,
        show: false
    },
    noData: {
        text: 'Click an area on the map to load AQI data...'
    }

}

var donut = new ApexCharts(
    document.querySelector("#donut"),
    options
);


donut.render();


