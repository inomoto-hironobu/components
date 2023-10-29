<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ogp="https://ogp.me/ns#"
  xmlns:yc="urn:yaohata-components"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="path" />
  <xsl:param name="param"/>
  <xsl:param name="dom"/>
  <xsl:variable name="source" select="document($path,.)"></xsl:variable>
  <xsl:variable name="ogpprefix" select="yc:ogpprefix($dom/html/@prefix)"/>

  <xsl:template match="@*">
    <xsl:attribute name="{name()}">
      <xsl:analyze-string select="." regex="#\{{.+?\}}">
        <xsl:matching-substring>
          <xsl:variable name="name" select="."/>
          <xsl:sequence select="map:get($param,$name)"/>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:sequence select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="yc:description">
    <xsl:value-of select="$source//meta[@property = yc:check('description')]/@content"></xsl:value-of>
  </xsl:template>

  <xsl:template match="yc:title">
    <xsl:value-of select="$source//meta[@property = yc:check('title')]/@content"></xsl:value-of>
  </xsl:template>

  <xsl:function name="yc:get" as="xs:string">
    <xsl:param name="name"/>
    <xsl:choose>
      <xsl:when test="$name = 'title'">
        <xsl:sequence select="$dom//title[1]/text()"/>
      </xsl:when>
      <xsl:when test="$name = 'description'">
        <xsl:sequence select="$dom//meta[@property = yc:check('description')]"/>
      </xsl:when>
    </xsl:choose>
  </xsl:function>

  <xsl:function name="yc:check">
    <xsl:param name="name"/>
    <xsl:message><xsl:value-of select="concat($ogpprefix,':',$name)"/></xsl:message>
    <xsl:sequence select="concat($ogpprefix,':',$name)"></xsl:sequence>
  </xsl:function>

  <xsl:function name="yc:ogpprefix">
    <xsl:param name="prefix"/>
    <xsl:analyze-string select="$prefix" regex=".+:\s*.+">
      <xsl:matching-substring>
        <xsl:if test="contains(.,'https://ogp.me/ns#')">
          <xsl:value-of select="substring-before(.,':')"/>
        </xsl:if>
      </xsl:matching-substring>
    </xsl:analyze-string>
  </xsl:function>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>