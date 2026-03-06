
const footChart = document.getElementById('footChart');

new Chart(footChart, {
    type: 'pie',
    data: {
        labels: ['Laptops', 'Desktops', 'Servers', 'Printers', 'Monitors'],
        datasets: [{
            data: [33, 17, 17, 17, 17],
            backgroundColor: [
                '#4e73df',
                '#1cc88a',
                '#f6c23e',
                '#e74a3b',
                '#858796'
            ]
        }]
    },
});

    
const barChart = document.getElementById('barChart');

new Chart(barChart, {
    type: 'bar',
    data: {
        labels: ['Hardware', 'Software'],
        datasets: [{
            label: 'Tickets',
            data: [4, 2],
            backgroundColor: '#4e73df'
        }]
    }
});

const lineCtx = document.getElementById('lineChart');

new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
        datasets: [{
            label: 'Costos',
            data: [450, 380, 520, 290, 650, 800, 420],
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78,115,223,0.1)',
            tension: 0.4, // 👈 esto hace la curva suave
            fill: true,
            pointRadius: 5
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        }
    }
});
