const objection = require('objection');
objection.Models = {};
const {
	// DBError,
	ValidationError,
	NotFoundError,
	ConstraintViolationError,
	UniqueViolationError,
	NotNullViolationError,
	ForeignKeyViolationError,
	CheckViolationError,
	DataError,
	Model
} = objection;
const Knex = require('knex');
const AjvKeywords = require('ajv-keywords');
const Path = require('path');

module.exports = function(app) {
	const knex = Knex({
		client: 'postgresql',
		connection: app.settings.database,
		pool: {
			min: 2,
			max: 10
		}
	});


	BaseModel.knex(knex);
	objection.BaseModel = BaseModel;
	['asset', 'message', 'page', 'user'].forEach((name) => {
		const model = require(Path.join('..', 'models', name));
		objection.Models[model.name] = model;
	});

	objection.tr = (fn) => {
		if (fn) return knex.transaction(fn);
		else return objection.transaction.start(knex);
	};
	objection.errorStatus = (err) => {
		if (err instanceof ValidationError
		|| err instanceof NotNullViolationError
		|| err instanceof CheckViolationError
		|| err instanceof DataError) {
			return 400;
		} else if (err instanceof NotFoundError) {
			return 404;
		} else if (err instanceof UniqueViolationError
		|| err instanceof ForeignKeyViolationError
		|| err instanceof ConstraintViolationError) {
			return 409;
		} else {
			return err.statusCode || err.code || 500;
		}
	};
	return objection;
};

class BaseQueryBuilder extends Model.QueryBuilder {
	sortBy(list) {
		if (!Array.isArray(list)) list = [list];
		list.forEach(str => {
			let dir = 'asc';
			if (str.startsWith('-')) {
				str = str.slice(1);
				dir = 'desc';
			}
			this.orderBy(str, dir);
		});
	}
	select(...args) {
		if (args.length == 0) {
			const model = this.modelClass();
			const table = this.tableRefFor(model);
			args = model.columns.map(col => `${table}.${col}`);
		}
		return super.select(...args);
	}
}

class BaseModel extends Model {
	static get QueryBuilder() {
		return BaseQueryBuilder;
	}
	static get columns() {
		return Object.keys(this.jsonSchema.properties);
	}
	static get modifiers() {
		return {
			columns: (query) => {
				query.select();
			}
		};
	}
	static createValidator() {
		return new objection.AjvValidator({
			onCreateAjv: (ajv) => {
				AjvKeywords(ajv);
			},
			options: {
				$data: true,
				allErrors: true,
				validateSchema: false,
				ownProperties: true,
				coerceTypes: 'array',
				removeAdditional: "all",
				nullable: true,
				formats: {
					singleline: /^[^\n\r]*$/,
					pathname: /^(\/[\w-.]*)+$/,
					id: /^[\w-]+$/
				}
			}
		});
	}
}

