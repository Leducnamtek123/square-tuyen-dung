import pytest
from rest_framework.test import APIRequestFactory
from shared.pagination import CustomPagination


def test_custom_pagination_with_page_size_query_param():
    paginator = CustomPagination()
    factory = APIRequestFactory()
    request = factory.get('/api/test/?page_size=5')
    
    queryset = list(range(20))
    page = paginator.paginate_queryset(queryset, request)
    
    assert len(page) == 5
    assert paginator.page.paginator.count == 20


def test_custom_pagination_with_pageSize_camel_case():
    paginator = CustomPagination()
    factory = APIRequestFactory()
    request = factory.get('/api/test/?pageSize=7')
    
    queryset = list(range(20))
    page = paginator.paginate_queryset(queryset, request)
    
    assert len(page) == 7
    assert paginator.page.paginator.count == 20


def test_custom_pagination_with_page_zero_or_negative():
    paginator = CustomPagination()
    factory = APIRequestFactory()
    
    request = factory.get('/api/test/?page=0&pageSize=5')
    queryset = list(range(20))
    page = paginator.paginate_queryset(queryset, request)
    
    # page 0 should normalize to page 1
    assert page == [0, 1, 2, 3, 4]
    assert paginator.page.number == 1

    request_neg = factory.get('/api/test/?page=-3&pageSize=5')
    page_neg = paginator.paginate_queryset(queryset, request_neg)
    assert page_neg == [0, 1, 2, 3, 4]
    assert paginator.page.number == 1


def test_custom_pagination_with_page_exceeding_max_pages():
    paginator = CustomPagination()
    factory = APIRequestFactory()
    
    # 20 items, 5 per page -> 4 pages. Request page 99
    request = factory.get('/api/test/?page=99&pageSize=5')
    queryset = list(range(20))
    page = paginator.paginate_queryset(queryset, request)
    
    # Instead of throwing 404 NotFound, it returns empty list with real count
    assert page == []
    assert paginator.page.paginator.count == 20
    
    response = paginator.get_paginated_response(page)
    assert response.data['count'] == 20
    assert response.data['results'] == []
