const axios = require('axios');
const cron = require('node-cron');
const config = require('../config.js');

module.exports = () => {
    let prometheusUrl = `${config.prometheus.protocol}://${config.prometheus.host}:${config.prometheus.port}${config.prometheus.path}api/v1/`;
    let prometheusClient = axios.create({
        baseUrl: prometheusUrl
    });

    let cachetUrl = `${config.cachet.protocol}://${config.cachet.host}:${config.cachet.port}${config.cachet.path}api/v1/`;
    let cachetClient = axios.create({
        baseUrl: cachetUrl,
        headers: {
            'X-Cachet-Token': config.cachet.apiKey
        }
    });

    cron.schedule('* * * * *', async () => {
        let latency = await prometheusClient.get('/query', {
            params: {
                query: 'avg(modmail_latency)'
            }
        });
        latency = latency.data.data.result[0].value[1];
        latency = Math.round(parseFloat(latency) * 1000);

        await cachetClient.post('/metrics/1/points', {
            data: {
                value: latency
            }
        });

        let status = await cachetClient.get('/components/1');
        status = status.data.data.status;

        if (status === 1 && latency >= config.latencyThreshold) {
            await cachetClient.put('/components/1', {
                status: 2
            });
        } else if (status === 2 && latency < config.latencyThreshold) {
            await cachetClient.put('/components/1', {
                status: 1
            });
        }
    });

    cron.schedule('* * * * *', async () => {
        let latencies = await prometheusClient.get('/query', {
            params: {
                query: 'modmail_latency'
            }
        });
        latencies = latencies.data.data.result.map(element => ({
            cluster: parseInt(element.metric.cluster),
            value: Math.round(parseFloat(element.value[2]) * 1000)
        }));

        let healthyCount = 0;

        for (let element of latencies) {
            if (element.value === 0) {
                await cachetClient.put(`/components/${element.cluster + 3}`, {
                    status: 4
                });
            } else if (element.value >= config.latencyThreshold) {
                healthyCount += 1;
                await cachetClient.put(`/components/${element.cluster + 3}`, {
                    status: 2
                });
            } else if (element.value < config.latencyThreshold) {
                healthyCount += 1;
                await cachetClient.put(`/components/${element.cluster + 3}`, {
                    status: 1
                });
            }
        }

        let status = await cachetClient.get('/components/1');
        status = status.data.data.status;

        if (status >= 3 && healthyCount === latencies.length) {
            await cachetClient.put('/components/1', {
                status: 1
            });
        } else if (healthyCount === 0) {
            await cachetClient.put('/components/1', {
                status: 4
            });
        } else if (healthyCount !== latencies.length) {
            await cachetClient.put('/components/1', {
                status: 3
            });
        }
    });
};
