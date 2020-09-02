const axios = require('axios');
const cron = require('node-cron');
const pm2 = require('pm2');
const config = require('../config.js');

module.exports = async bot => {
    let prometheusUrl = `${config.prometheus.protocol}://${config.prometheus.host}:${config.prometheus.port}${config.prometheus.path}api/v1/`;
    let prometheusClient = axios.create({
        baseURL: prometheusUrl
    });

    let cachetUrl = `${config.cachet.protocol}://${config.cachet.host}:${config.cachet.port}${config.cachet.path}api/v1/`;
    let cachetClient = axios.create({
        baseURL: cachetUrl,
        headers: {
            'X-Cachet-Token': config.cachet.apiKey
        }
    });

    let comp = {};

    let components = await cachetClient.get('/components');
    components = components.data.data;

    for (let element of components) {
        comp[element.name.toLowerCase()] = element.id;
    }

    let metric = {};

    let metrics = await cachetClient.get('/metrics');
    metrics = metrics.data.data;

    for (let element of metrics) {
        metric[element.name.toLowerCase()] = element.id;
    }

    cron.schedule('*/10 * * * * *', async () => {
        let latency = await prometheusClient.get('/query', {
            params: {
                query: 'avg(modmail_latency)'
            }
        });
        latency = latency.data.data.result[0].value[1];
        latency = Math.round(parseFloat(latency) * 1000);

        await cachetClient.post(`/metrics/${metric['gateway latency']}/points`, {
            value: latency
        });

        let status = await cachetClient.get(`/components/${comp['bot']}`);
        status = status.data.data.status;

        if (status === 1 && latency >= config.latencyThreshold) {
            await cachetClient.put(`/components/${comp['bot']}`, {
                status: 2
            });
        } else if (status === 2 && latency < config.latencyThreshold) {
            await cachetClient.put(`/components/${comp['bot']}`, {
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
            value: Math.round(parseFloat(element.value[1]) * 1000)
        }));

        let healthyCount = 0;

        for (let element of latencies) {
            if (element.value === 0) {
                await cachetClient.put(`/components/${comp['cluster ' + element.cluster]}`, {
                    status: 4
                });
            } else if (element.value >= config.latencyThreshold) {
                healthyCount += 1;
                await cachetClient.put(`/components/${comp['cluster ' + element.cluster]}`, {
                    status: 2
                });
            } else if (element.value < config.latencyThreshold) {
                healthyCount += 1;
                await cachetClient.put(`/components/${comp['cluster ' + element.cluster]}`, {
                    status: 1
                });
            }
        }

        let status = await cachetClient.get(`/components/${comp['bot']}`);
        status = status.data.data.status;

        if (status >= 3 && healthyCount === latencies.length) {
            await cachetClient.put(`/components/${comp['bot']}`, {
                status: 1
            });
        } else if (healthyCount === 0) {
            await cachetClient.put(`/components/${comp['bot']}`, {
                status: 4
            });
        } else if (healthyCount !== latencies.length) {
            await cachetClient.put(`/components/${comp['bot']}`, {
                status: 3
            });
        }
    });

    cron.schedule('* * * * *', async () => {
        let status = await axios.get('https://modmail.xyz/');
        status = status.status;

        if (status === 200) {
            await cachetClient.put(`/components/${comp['website']}`, {
                status: 1
            });
        } else {
            await cachetClient.put(`/components/${comp['website']}`, {
                status: 4
            });
        }
    });

    cron.schedule('* * * * *', async () => {
        pm2.connect(async err => {
            if (err) {
                await cachetClient.put(`/components/${comp['microservices']}`, {
                    status: 4
                });
                return;
            }

            pm2.list(async (err, list) => {
                if (err) return;

                let healthyCount = 0;
                list.forEach(element => {
                    if (element.status !== 'errored') {
                        healthyCount += 1;
                    }
                });

                if (healthyCount === list.length) {
                    await cachetClient.put(`/components/${comp['microservices']}`, {
                        status: 1
                    });
                } else if (healthyCount === 0) {
                    await cachetClient.put(`/components/${comp['microservices']}`, {
                        status: 4
                    });
                } else if (healthyCount !== list.length) {
                    await cachetClient.put(`/components/${comp['microservices']}`, {
                        status: 3
                    });
                }
            });
        });
    });

    cron.schedule('* * * * *', async () => {
        let status = await axios.get('https://srhpyqt94yxb.statuspage.io/api/v2/summary.json');
        let indicator = status.data.status.indicator;

        if (indicator === 'none') {
            await cachetClient.put(`/components/${comp['discord']}`, {
                status: 1
            });
        } else if (indicator === 'minor') {
            await cachetClient.put(`/components/${comp['discord']}`, {
                status: 3
            });
        } else {
            await cachetClient.put(`/components/${comp['discord']}`, {
                status: 4
            });
        }
    });

    cron.schedule('* * * * *', async () => {
        let status = await axios.get('https://yh6f0r4529hb.statuspage.io/api/v2/summary.json');
        let indicator = status.data.status.indicator;

        if (indicator === 'minor') {
            let fault = status.data.components.find(element => {
                return element.status !== 'operational' && element.status !== 'partial_outage';
            });
            if (!fault) {
                indicator = 'none';
            }
        }

        if (indicator === 'none') {
            await cachetClient.put(`/components/${comp['cloudflare']}`, {
                status: 1
            });
        } else if (indicator === 'minor') {
            await cachetClient.put(`/components/${comp['cloudflare']}`, {
                status: 3
            });
        } else {
            await cachetClient.put(`/components/${comp['cloudflare']}`, {
                status: 4
            });
        }
    });
};
