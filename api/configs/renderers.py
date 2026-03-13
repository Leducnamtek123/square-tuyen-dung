
from rest_framework.renderers import JSONRenderer
from configs import variable_response

class MyJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # If the view already returned the canonical envelope, pass through.
        # This prevents "double-wrapping" when using `variable_response.response_data`
        # together with this renderer.
        if isinstance(data, dict) and set(data.keys()) == {'errors', 'data'}:
            return super().render(data, accepted_media_type, renderer_context)

        response = variable_response.data_response({}, None)
        if renderer_context and 'response' in renderer_context:
            response_obj = renderer_context['response']
            if response_obj.status_code >= 400:
                errors = response_obj.data

                # Pass through if the error is already wrapped.
                if isinstance(errors, dict) and set(errors.keys()) == {'errors', 'data'}:
                    response = errors
                elif isinstance(errors, dict):
                    response = variable_response.data_response(data=None, errors=errors)
                else:
                    response = variable_response.data_response(data=errors, errors={})
            elif 200 <= response_obj.status_code < 300:
                response = variable_response.data_response(data=data,
                                                           errors={})
        return super().render(response, accepted_media_type, renderer_context)
