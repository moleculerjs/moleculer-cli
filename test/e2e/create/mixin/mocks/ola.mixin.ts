import { Context, Service, ServiceSchema } from "moleculer";
import { Document, Schema, connect, model } from "mongoose";

export default class OlaConnection implements Partial<ServiceSchema>, ThisType<Service>{

    private collection: string;
    private modelSchema: Schema;
	private schema: Partial<ServiceSchema> & ThisType<Service>;

    public constructor(public collectionName: string, modelSchema: Schema) {
		this.collection = collectionName;
        this.modelSchema = modelSchema;
		this.schema = {
            actions: {
                create: {
                    rest: "POST /",
                    async handler(ctx: Context) {
                        const { params } = ctx;
                        this.adapter.create(params, (err: Error, saved: Document) => {
                            if (err) {this.logger.error(err);};
                            this.logger.info(saved);
                        });
                    },
                },
                update: {
                    rest: "PUT /:id",
                    async handler(ctx: Context<{id: string}>) {
                        const { params } = ctx;
                        this.adapter.findOneAndUpdate(
                            { _id: params.id },
                            params,
                            (err: Error, saved: Document) => {
                                if (err) {this.logger.error(err);}
                                this.logger.info(saved);
                            }
                        );
                    },
                },
                list: {
                    rest: "GET /",
                    async handler(ctx: Context) {
                        return this.adapter.find({});
                    },
                },

                delete: {
                    rest: "DELETE /:id",
                    async handler(ctx: Context<{id: string}>) {
                        const { params } = ctx;
                        this.adapter.deleteOne({ _id: params.id });
                    },
                },
            },
            methods: {
                connectDb() {
                    return connect("mongodb://localhost:27017/test")
                        .then(() => this.logger.info("Connected"))
                        .catch((err: Error) => this.logger.error(err));
                },
            },
            async started(){
                this.connectDb();
            },
        };
    }
    public start(){
        this.schema.adapter = model(this.collection, this.modelSchema);
        return this.schema;
    }
};
