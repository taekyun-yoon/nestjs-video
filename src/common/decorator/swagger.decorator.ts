import { applyDecorators, Type } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageResDto } from '../dto/res.dto';

export const ApiGetResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        //200 responseCode
        ApiOkResponse({
        schema: {
            allOf: [{ $ref: getSchemaPath(model) }],
        },
        }),
    );
    };

    export const ApiPostResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        //201 responseCode
        ApiCreatedResponse({
        schema: {
            allOf: [{ $ref: getSchemaPath(model) }],
        },
        }),
    );
    };

    export const ApiGetItemsResponse = <TModel extends Type<any>>(model: TModel) => {
        return applyDecorators(
            ApiOkResponse({
                schema: {
                    allOf: [
                        { $ref: getSchemaPath(PageResDto) },
                        {
                            properties: {
                                items: {
                                    type: 'array',
                                    items: { $ref: getSchemaPath(model) },
                                },
                            },
                        },
                    ],
                },
            }),
        );
    };
