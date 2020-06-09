import formidable from 'formidable';

export default function formidablePromise (req, opts?) {
	return new Promise((resolve, reject) => {
		var form = new formidable.IncomingForm(opts);
		form.parse(req, (err, fields, files) => {
			if (err) return reject(err);
			return resolve({ fields: fields, files: files });
		});
	});
};
