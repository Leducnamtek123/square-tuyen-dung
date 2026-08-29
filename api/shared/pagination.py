
from collections import OrderedDict
from django.core.paginator import InvalidPage, EmptyPage, Page
from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    page_size = 12
    page_size_query_param = 'pageSize'
    max_page_size = 10000

    def get_page_size(self, request):
        if not request:
            return self.page_size

        params = getattr(request, 'query_params', getattr(request, 'GET', {}))
        # Check pageSize, page_size, and configured page_size_query_param
        val = (
            params.get(self.page_size_query_param)
            or params.get('page_size')
            or params.get('pageSize')
        )
        if val is not None:
            try:
                val_int = int(val)
                if val_int > 0:
                    return min(val_int, self.max_page_size)
            except (KeyError, ValueError, TypeError):
                pass
        return self.page_size

    def paginate_queryset(self, queryset, request, view=None):
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        params = getattr(request, 'query_params', getattr(request, 'GET', {}))
        page_param = params.get(self.page_query_param, 1)

        try:
            page_number = int(page_param)
            if page_number < 1:
                page_number = 1
        except (ValueError, TypeError):
            if page_param in self.last_page_strings:
                page_number = paginator.num_pages or 1
            else:
                page_number = 1

        try:
            self.page = paginator.page(page_number)
        except (InvalidPage, EmptyPage):
            # Create an empty page for out-of-bounds queries without raising a 404
            self.page = Page([], page_number, paginator)

        self.request = request
        return list(self.page)

    def get_paginated_response(self, data):
        count = (
            self.page.paginator.count
            if (self.page is not None and getattr(self.page, 'paginator', None) is not None)
            else len(data)
        )
        return Response({
            'count': count,
            'results': data
        })
