import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Container,
    Typography,
    Grid2 as Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Breadcrumbs,
    Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const BlogPage = () => {
    const { t } = useTranslation('employer');

    const blogPosts = [
        {
            id: 1,
            title: t('blog.placeholders.exp_title'),
            description: t('blog.placeholders.exp_desc'),
            image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auhref=format&fit=crop&w=800&q=60',
        },
        {
            id: 2,
            title: t('blog.placeholders.tips_title'),
            description: t('blog.placeholders.tips_desc'),
            image: 'https://images.unsplash.com/photo-1454165833772-d99626a4407a?ixlib=rb-4.0.3&auhref=format&fit=crop&w=800&q=60',
        },
        {
            id: 3,
            title: t('blog.placeholders.trends_title'),
            description: t('blog.placeholders.trends_desc'),
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auhref=format&fit=crop&w=800&q=60',
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ mb: 3 }}
            >
                <MuiLink component={Link} underline="hover" color="inherit" href="/employer/dashboard" {...({} as Record<string, unknown>)}>
                    {t('sidebar.dashboard')}
                </MuiLink>
                <Typography color="text.primary">{t('blog.title')}</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                    {t('blog.title')}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px' }}>
                    {t('blog.subtitle')}
                </Typography>
            </Box>

            {/* Blog Grid */}
            <Grid container spacing={4}>
                {blogPosts.map((post) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                            },
                        }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={post.image}
                                alt={post.title}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2" fontWeight="bold">
                                    {post.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {post.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default BlogPage;
