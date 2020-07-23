/* Dependencies */
const express = require('express');
const bodyParser = require("body-parser");
const nodeMailer = require("nodemailer");
const path = require('path');

require('dotenv').config(); /* Enable Environmental Variables */

const server = express(); /* Server Instance */

/* Server Configurations */
server.use(express.static(path.join(__dirname, '/public')));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.set('views', './views');
server.set('view engine', 'ejs');

const port = process.env.PORT || 3000; /* Server Port */

server.listen(port, () => console.log(`Server's Running - Port: ${port}`)); /* Start the Server */

/* Initial Route */
server.get('/:version', (req, res) => {
	const year = new Date().getFullYear();
	const version = req.params.version || '';
	const success = req.query.success || '';

	if (version == 'en') {
		return res.status(200).render('en', { year, version, success });
	} else {
		return res.status(200).render('index', { year, version, success });
	}
});

server.post('/mail', async (req, res) => {
	try {

		const { name, email, message } = req.body;
		const version = req.query.version || 'pt';

		var errorMessage = {
			one: `<b>Preencha todo o formulário! <a href="/pt#contact">Voltar</a><b>`,
			two: `<b>Ocorreu um error ao enviar a sua mensagem! Tente mais tarde. <a href="/pt#contact">Voltar</a><b>`
		}

		if (version == 'en') {
			errorMessage.one = `<b>Complete the entire form! <a href="/en#contact">Home</a><b>`;
			errorMessage.two = `<b>An error ocurred while sending your e-mail! Try again later. <a href="/en#contact">Home</a><b>`;
		}

		if (!name || !email || !message) {
			return res.status(400).send(errorMessage.one);
		}

		const transporter = nodeMailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASSWORD
			}
		});

		const mailBody = {
			from: `Web Portfolio E-mail <${process.env.MAIL_USER}>`,
			to: `neviocostamagagnin@gmail.com`,
			subject: `Web Portfolio E-mail`,
			html: `
				<!DOCTYPE html>
				<head>
					<meta charset="utf-8">
					<style type="text/css">
						@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
						* { margin: 0; padding: 0; overflow-x: hidden; font-family: 'Lato', sans-serif; }
						body { padding: 35px; }
						h1 { font-size: 20px; text-align: center; }
						h1 b { color: #ff9900; }
						p { text-align: justify; margin: 20px 0 20px 0; font-weight: bold; }
						b { text-align: left; }
						b span { color: #ff9900 }
						br { margin-bottom: 5px  }
					</style>
				</head>
				<body>
					<h1>E-mail enviado por - <b>${name}</b></h1>
					<p>${message}</p>
					<b>Data do Envio: <span>${new Date().toLocaleString()}</span></b>
					<br>
					<b>E-mail: <span>${email}</span></b>
				</body>
				</html>
			`
		}

		await transporter.sendMail(mailBody, (err) => {
			if (err) {
				return res.status(400).send(errorMessage.two);
			} else {
				return res.redirect(`/${version}?success=true#contact`);
			}
		});

	} catch (err) {

		const version = req.query.version || 'pt';

		if (version == 'en') {
			return res.status(500).send(`<b>An error ocurred while sending your e-mail! Try again later. <a href="/en#contact">Home</a><b>`);
		} else {
			return res.status(500).send(`<b>Ocorreu um error ao enviar a sua mensagem! Tente mais tarde. <a href="/pt#contact">Voltar</a><b>`);
		}

	}
});