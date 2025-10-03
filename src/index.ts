import { get_timetable, get_course } from 'celcat';

import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/edt/:id', async (req: Request, res: Response) => {
    if (!req.params.id) {
        res.status(400).send("Missing id");
        return;
    }

    if (!req.query.start) {
        res.status(400).send("Missing start date");
        return;
    }

    let _start, _end

    if (isNaN(Date.parse(req.query.start.toString()))) {
        res.status(400).send("Invalid start");
        return;
    } else {
        _start = new Date(req.query.start.toString())
    }


    if (req.query.end) {
        if (isNaN(Date.parse(req.query.end.toString()))) {
            res.status(400).send("Invalid end");
            return;
        } else {
            _end = new Date(req.query.end.toString())
        }
    } else {
        _end = undefined
    }

    let data = [];

    try {
        data = await get_timetable(req.params.id, _start, _end);
    } catch(e: unknown) {
        if (e instanceof Error) {
            switch (e.message) {
                case "Missing group id":
                    res.status(400).send("Missing group id");
                    break;
                case "Missing start date":
                    res.status(400).send("Missing start");
                    break;
                default:
                    res.status(500).send(e.message);
            }
        } else {
            res.status(500);
        }

        return;
    }

    res.status(200).send(data);
});

app.post('/ping', (req, res) => {
    res.status(200).send("pong");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});