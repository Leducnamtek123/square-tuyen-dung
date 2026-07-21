app_name = "square_hrm_branding"
app_title = "Square HRM"
app_publisher = "Square"
app_description = "Square HRM interface branding"
app_email = "engineering@square.vn"
app_license = "Proprietary UI customizations"
app_logo_url = "/assets/square_hrm_branding/images/square/text-logo-black.svg"

app_include_js = [
    "/assets/square_hrm_branding/js/square_hrm_branding_web.bundle.js",
    "/assets/square_hrm_branding/js/square_hrm_branding.bundle.js",
]
app_include_css = "/assets/square_hrm_branding/css/square_hrm_branding.css"
web_include_js = "/assets/square_hrm_branding/js/square_hrm_branding_web.bundle.js"
web_include_css = "/assets/square_hrm_branding/css/square_hrm_branding.css"

brand_html = '<span class="square-hrm-web-brand"><img src="/assets/square_hrm_branding/images/square/text-logo-black.svg" alt="Square" /><span class="square-hrm-web-brand__suffix">HRM</span></span>'

after_install = "square_hrm_branding.install.apply_branding"
after_migrate = "square_hrm_branding.install.apply_branding"
extend_bootinfo = ["square_hrm_branding.boot.extend_bootinfo"]
