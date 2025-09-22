const ical = require('ical');

function recupJourInt(date) {
    if (!date) return;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0"); // mois = 0-11
    const d = String(date.getDate()).padStart(2, "0");

    return parseInt(`${y}${m}${d}`);
}

async function charger_ical(id) {
    const res = await fetch(`https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/${id}/schedule.ics`);
    console.log(`https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/${id}/schedule.ics`)

    if (res.status == 200) {
        const data = await res.text();
        return [200, data];
    } else {
        return [res.status, res.text];
    }
}

function parseFromData(data) {
    const cal = ical.parseICS(data);


    const evs = Object.values(cal).map(ev => ({
        summary: ev.summary,
        start: ev.start,
        end: ev.end,
        location: ev.location,
        description: ev.description
    }));

    evs.sort((a, b) => recupJourInt(a.start) - recupJourInt(b.start));

    return evs
}


/********************************/

const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

app.get('/edt/:id', async (req, res) => {
    const data = await charger_ical(req.params.id);

    if (data[0] != 200) {
        res.status(data[0]).send(data[1]);
        return;
    }

    let _start = recupJourInt(new Date(req.query.start)) || 0
    let _end = recupJourInt(new Date(req.query.end)) || (_start == 0 ? 21001231 : (_start + 5))

    const edt = data[1];
    const events = parseFromData(edt)
    let result = []

    for (let i = 1; i < events.length; i++) {
        ev = events[i]
        _date = recupJourInt(ev.start)
        if (_start <= _date && _date <= _end) {
            result.push(ev)
        } else {
            if (_start == _date) {
                console.log(ev.summary)
                console.log(_start)
                console.log(recupJourInt(ev.start))
                console.log(_end)
            }
        }
    }

    res.status(200).send(result);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
