#!/bin/sh
# Use this script to install OS dependencies, downloading and compile moloch dependencies, and compile moloch capture.

# This script will 
# * use apt-get/yum to install OS dependancies
# * download known working versions of moloch dependancies
# * build them statically 
# * configure moloch-capture to use them
# * build moloch-capture


GLIB=2.47.4  #CONFLICTOR
YARA=1.7  #CONFLICTOR
GEOIP=1.6.0  #CONFLICTOR
PCAP=1.7.4  #CONFLICTOR
CURL=7.42.1  #CONFLICTOR

TDIR="/data/moloch"
DOPFRING=0

while :
do
  case $1 in
  -p | --pf_ring | --pfring)
    DOPFRING=1
    shift
    ;;
  -d | --dir)
    TDIR=$2
    shift 2
    ;;
  -*)
    echo "Unknown option '$1'"
    exit 1
    ;;
  *)
    break
    ;;
  esac
done


MAKE=make

# Installing dependencies
echo "MOLOCH: Installing Dependencies"
if [ -f "/etc/redhat-release" ]; then
  yum -y install wget curl pcre pcre-devel pkgconfig flex bison gcc-c++ zlib-devel e2fsprogs-devel openssl-devel file-devel make gettext libuuid-devel perl-JSON bzip2-libs bzip2-devel perl-libwww-perl libpng-devel xz libffi-devel
  if [ $? -ne 0 ]; then
    echo "MOLOCH - yum failed"
    exit 1
  fi
fi

if [ "$(uname)" == "FreeBSD" ]; then
    pkg_add -Fr wget curl pcre flex bison gettext e2fsprogs-libuuid glib gmake libexecinfo
    MAKE=gmake
fi




echo "MOLOCH: Downloading and building static thirdparty libraries"
if [ ! -d "thirdparty" ]; then
  mkdir thirdparty
fi
cd thirdparty

# glib
if [ "$(uname)" == "FreeBSD" ]; then
  #Screw it, use whatever the OS has
  WITHGLIB=" "
else
  WITHGLIB="--with-glib2=thirdparty/glib-$GLIB"
  if [ ! -f "glib-$GLIB.tar.xz" ]; then
    GLIBDIR=$(echo $GLIB | cut -d. -f 1-2)
    wget http://ftp.gnome.org/pub/gnome/sources/glib/$GLIBDIR/glib-$GLIB.tar.xz
  fi

  if [ ! -f "glib-$GLIB/gio/.libs/libgio-2.0.a" -o ! -f "glib-$GLIB/glib/.libs/libglib-2.0.a" ]; then
    xzcat glib-$GLIB.tar.xz | tar xf -
    (cd glib-$GLIB ; ./configure --disable-xattr --disable-shared --enable-static --disable-libelf --disable-selinux; $MAKE)
    if [ $? -ne 0 ]; then
      echo "MOLOCH: $MAKE failed"
      exit 1
    fi
  else
    echo "MOLOCH: Not rebuilding glib"
  fi
fi

# yara
if [ ! -f "yara-$YARA.tar.gz" ]; then
  wget https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/yara-project/yara-$YARA.tar.gz
fi

if [ ! -f "yara-$YARA/libyara/.libs/libyara.a" ]; then
  tar zxf yara-$YARA.tar.gz
  (cd yara-$YARA; ./configure --enable-static; $MAKE)
  if [ $? -ne 0 ]; then
    echo "MOLOCH: $MAKE failed"
    exit 1
  fi
else
  echo "MOLOCH: Not rebuilding yara"
fi

# GeoIP
if [ ! -f "GeoIP-$GEOIP.tar.gz" ]; then
  wget http://www.maxmind.com/download/geoip/api/c/GeoIP-$GEOIP.tar.gz
fi

if [ ! -f "GeoIP-$GEOIP/libGeoIP/.libs/libGeoIP.a" ]; then
tar zxf GeoIP-$GEOIP.tar.gz

# Crossing fingers, this is no longer needed
# Not sure why this is required on some platforms
#  if [ -f "/usr/bin/libtoolize" ]; then
#    (cd GeoIP-$GEOIP ; libtoolize -f)
#  fi

  (cd GeoIP-$GEOIP ; ./configure --enable-static; $MAKE)
  if [ $? -ne 0 ]; then
    echo "MOLOCH: $MAKE failed"
    exit 1
  fi
else
  echo "MOLOCH: Not rebuilding libGeoIP"
fi

echo "MOLOCH: Building libpcap";
# libpcap
if [ ! -f "libpcap-$PCAP.tar.gz" ]; then
  wget http://www.tcpdump.org/release/libpcap-$PCAP.tar.gz
fi
tar zxf libpcap-$PCAP.tar.gz
(cd libpcap-$PCAP; ./configure --disable-dbus --disable-usb --disable-canusb --disable-bluetooth; $MAKE)
if [ $? -ne 0 ]; then
  echo "MOLOCH: $MAKE failed"
  exit 1
fi
PCAPDIR=`pwd`/libpcap-$PCAP
PCAPBUILD="--with-libpcap=$PCAPDIR"

# curl
if [ ! -f "curl-$CURL.tar.gz" ]; then
  wget http://curl.haxx.se/download/curl-$CURL.tar.gz
fi

if [ ! -f "curl-$CURL/lib/.libs/libcurl.a" ]; then
  tar zxf curl-$CURL.tar.gz
  ( cd curl-$CURL; ./configure --disable-ldap --disable-ldaps --without-libidn --without-librtmp; $MAKE)
  if [ $? -ne 0 ]; then
    echo "MOLOCH: $MAKE failed"
    exit 1
  fi
else 
  echo "MOLOCH: Not rebuilding curl"
fi


# Now build moloch
#echo "MOLOCH: Building capture"
#cd ..
#echo "./configure --prefix=$TDIR $PCAPBUILD --with-yara=thirdparty/yara-$YARA --with-GeoIP=thirdparty/GeoIP-$GEOIP $WITHGLIB --with-curl=thirdparty/curl-$CURL"
#./configure --prefix=$TDIR $PCAPBUILD --with-yara=thirdparty/yara-$YARA --with-GeoIP=thirdparty/GeoIP-$GEOIP $WITHGLIB --with-curl=thirdparty/curl-$CURL
#
exit 0
