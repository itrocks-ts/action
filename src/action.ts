import { HtmlResponse } from '@itrocks/core-responses'
import { JsonResponse } from '@itrocks/core-responses'
import { Headers }      from '@itrocks/request-response'

export class Action
{

	htmlResponse(body: string, statusCode = 200, headers: Headers = {})
	{
		return new HtmlResponse(body, statusCode, headers)
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
