
from rest_framework.renderers import JSONRenderer
from shared.configs import variable_response

class MyJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # Keep success responses raw; only normalize error responses.
        if renderer_context and 'response' in renderer_context:
            response_obj = renderer_context['response']
            if 200 <= response_obj.status_code < 300:
                if isinstance(data, dict) and set(data.keys()) == {'errors', 'data'}:
                    return super().render(data.get('data'), accepted_media_type, renderer_context)
                return super().render(data, accepted_media_type, renderer_context)

            errors = response_obj.data
            if isinstance(errors, dict) and set(errors.keys()) == {'errors', 'data'}:
                return super().render(errors, accepted_media_type, renderer_context)
            if isinstance(errors, dict):
                normalized = variable_response.data_response(data=None, errors=errors)
                return super().render(normalized, accepted_media_type, renderer_context)
            normalized = variable_response.data_response(data=errors, errors={})
            return super().render(normalized, accepted_media_type, renderer_context)

        return super().render(data, accepted_media_type, renderer_context)
