import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "Aurevian Collections",
  description = "Luxury Jewellery & Accessories by Aurevian Collections",
  keywords = "Jewellery, Aurevian, Accessories",
}) => {
  return (
    <Helmet>
      <title>{title} | Aurevian Collections</title>

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={`${title} | Aurevian Collections`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;