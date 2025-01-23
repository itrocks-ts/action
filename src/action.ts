import { HtmlResponse } from '@itrocks/core-responses'
import { JsonResponse } from '@itrocks/core-responses'
import { Headers }      from '@itrocks/request-response'
import { Request }      from './request'

export class Action
{

	htmlResponse(body: string, statusCode = 200, headers: Headers = {})
	{
		return new HtmlResponse(body, statusCode, headers)
	}

	async htmlTemplateResponse(data: any, request: Request, templateFile: string, statusCode = 200, headers: Headers = {})
	{
		return this.htmlResponse(data.toString(), statusCode, headers)
	}

	jsonResponse(data: any, statusCode = 200, headers: Headers = {})
	{
		return new JsonResponse(data, statusCode, headers)
	}

}

export {
	Actions,
	actionsOf,
	setDefaultActions
} from './actions'

export {
	Need,
	needOf,
	NOTHING
} from './need'

export {
	Request,
	requestDependsOn
} from './request'
