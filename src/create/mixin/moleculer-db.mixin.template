"use strict";

const fs = require("fs");
const mongoose = require("mongoose"); // npm i mongoose -S

module.exports = (collection, modelSchema) => {
	const schema = {
		actions: {
			create: {
				rest: "POST /",
				async handler(ctx) {
					const { params } = ctx;
					console.log(this.adapter);
					this.adapter.create(params, (err, saved) => {
						if (err) this.logger.error(err);
						this.logger.info(saved);
					});
				},
			},
			update: {
				rest: "PUT /:id",
				async handler(ctx) {
					const { params } = ctx;
					this.adapter.findOneAndUpdate(
						{ _id: params.id },
						params,
						(err, saved) => {
							if (err) this.logger.error(err);
							this.logger.info(saved);
						}
					);
				},
			},
			list: {
				rest: "GET /",
				async handler(ctx) {
					const { params } = ctx;
					return this.adapter.find({});
				},
			},

			delete: {
				rest: "DELETE /:id",
				async handler(ctx) {
					const { params } = ctx;
					this.adapter.deleteOne({ _id: params.id });
				},
			},
		},
		methods: {
			_connect() {
				return mongoose
					.connect("mongodb://localhost:27017/test")
					.then(() => this.logger.info("Connected"))
					.catch((err) => this.logger.error(err));
			},
		},

		async started() {
			this._connect();
			if (!this.adapter) {
				this.adapter = mongoose.model(collection, modelSchema);
			}
		},
	};

	return schema;
};
