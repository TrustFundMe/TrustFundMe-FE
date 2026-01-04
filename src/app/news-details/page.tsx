import BlogSidebar from "@/components/BlogSidebar";
import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";
import Image from "next/image";
import Link from "next/link";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="News Details" />
      <section className="blog-wrapper news-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="blog-post-details border-wrap">
                <div className="single-blog-post post-details">
                  <div className="post-content">
                    <div className="post-cat">
                      <Link href="/news">Charity</Link>
                    </div>
                    <h2>Back to the future: Quality education through</h2>
                    <div className="post-meta">
                      <span>
                        <i className="fal fa-comments" />
                        35 Comments
                      </span>
                      <span>
                        <i className="fal fa-calendar-alt" />
                        24th Jan 2024
                      </span>
                    </div>
                    <p>
                      We have a proven record of best result of building and
                      reputable company in the United States. Thousands of
                      successful projects we are one of the most trusted
                      construction companies. We have a proven record of best
                      result of building and reputable company in the United
                      States.
                    </p>
                    <p>
                      Northern anchovy–bass yellowtail barracuda zander
                      yellowfin grouper gurnard skipjack tuna shark burrowing
                      goby eulachon wobbegong. Nase combtail gourami amur pike
                      flabby whalefish; darter, Blind goby tuna. Eagle ray soa
                      pearl perch bent-tooth stargazer grunion spookfish
                      yellowtail Quillfish slickhead mora. snake worm mackerel
                      sockeye salmon banjo catfish toadfish sauger four-eyed
                      fish
                    </p>
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ height: "auto", width: "100%" }}
                      src="/assets/img/news/post5.jpg"
                      alt="blog__img"
                    />
                    <h3>An Airborne Crisis on Two Fronts</h3>
                    <p>
                      This shortage is being seen in both the airline and the
                      cargo industries. With such a small pool of applicants to
                      choose from, these two sectors are battling to get the
                      most qualified available candidates. Many pilots are
                      increasingly being wooed to get behind the controls of
                      passenger planes over cargo flights—frankly, it’s tough to
                      compete with jobs perks like fixed schedules and free
                      flights for your family across the world.
                    </p>
                    <blockquote>
                      Thousands of successful projects we are one of the most
                      trusted construction companies.
                    </blockquote>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                      sed do eiusmod tempor incidid unt ut labore et dolore
                      magna aliqua. Ut enim ad minim veniam, quis nostrud
                      exercitation ullamco laboris nisi ut aliquip ex ea commodo
                      consequat. Duis aute.
                    </p>
                    <ul className="checked-list mb-3">
                      <li>We track every dollar</li>
                      <li>We’re an open book</li>
                      <li>100% goes to the field</li>
                      <li>Received the highest grades</li>
                    </ul>
                    <h3>A cleansing hot shower or bath</h3>
                    <p>
                      Just as we’ve found with the truck driver shortage, the
                      impetus behind skilled labor leaving is many-fold.
                      Demographics play a large role—a massive amount of pilots
                      are expected to hang up their hats in the next few years
                      as they reach the mandatory commercial pilot retirement
                      age of 65. And there’s no large group of applicants
                      sitting waiting to replace them.This is likely because
                      it’s becoming considerably more difficult to obtain a
                      pilot license than it was ten years ago.
                    </p>
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ height: "auto", width: "255px" }}
                      className="alignleft"
                      src="/assets/img/news/post6.jpg"
                      alt="blog__img"
                    />
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum. Sed ut
                      perspiciatis unde omnis iste natus error sit voluptatem
                      accusantium doloremque laudantium.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                      sed do eiusmod tempor incidid unt ut labore et dolore
                      magna aliqua. Ut enim ad minim veniam, quis nostrud
                      exercitation ullamco laboris nisi ut aliquip ex ea commodo
                      consequat. Duis aute irure dolor in repreh enderit in
                      voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur.
                    </p>
                  </div>
                </div>
                <div className="row tag-share-wrap">
                  <div className="col-lg-8 col-12">
                    <h4>Releted Tags</h4>
                    <div className="tagcloud">
                      <Link href="/news-details">logitics</Link>
                      <Link href="/news-details">transport</Link>
                      <Link href="/news-details">cargo</Link>
                    </div>
                  </div>
                  <div className="col-lg-4 col-12 mt-3 mt-lg-0 text-lg-end">
                    <h4>Social Share</h4>
                    <div className="social-share">
                      <a href="#">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a href="#">
                        <i className="fab fa-twitter" />
                      </a>
                      <a href="#">
                        <i className="fab fa-instagram" />
                      </a>
                      <a href="#">
                        <i className="fab fa-linkedin-in" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* comments section wrap start */}
                <div className="comments-section-wrap pt-40">
                  <div className="comments-heading">
                    <h3>03 Comments</h3>
                  </div>
                  <ul className="comments-item-list">
                    <li className="single-comment-item">
                      <div className="author-img">
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ height: "140px", width: "140px" }}
                          src="/assets/img/news/author_img2.jpg"
                          alt="img"
                        />
                      </div>
                      <div className="author-info-comment">
                        <div className="info">
                          <h5>
                            <a href="#">Rosalina Kelian</a>
                          </h5>
                          <span>19th May 2024</span>
                          <a href="#" className="minimal-btn">
                            <i className="fal fa-reply" />
                            Reply
                          </a>
                        </div>
                        <div className="comment-text">
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna. Ut enim ad minim veniam, quis nostrud
                            laboris nisi ut aliquip ex ea commodo consequat.
                          </p>
                        </div>
                      </div>
                    </li>
                    <li className="single-comment-item">
                      <div className="author-img">
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ height: "140px", width: "140px" }}
                          src="/assets/img/news/author_img3.jpg"
                          alt="img"
                        />
                      </div>
                      <div className="author-info-comment">
                        <div className="info">
                          <h5>
                            <a href="#">Arista Williamson</a>
                          </h5>
                          <span>21th Feb 2024</span>
                          <a href="#" className="minimal-btn">
                            <i className="fal fa-reply" />
                            Reply
                          </a>
                        </div>
                        <div className="comment-text">
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco nisi ut aliquip ex ea
                            commodo consequat.
                          </p>
                        </div>
                      </div>
                      <ul className="replay-comment">
                        <li className="single-comment-item">
                          <div className="author-img">
                            <Image
                              width={0}
                              height={0}
                              sizes="100vw"
                              style={{ height: "140px", width: "140px" }}
                              src="/assets/img/news/author_img4.jpg"
                              alt="img"
                            />
                          </div>
                          <div className="author-info-comment">
                            <div className="info">
                              <h5>
                                <a href="#">Salman Ahmed</a>
                              </h5>
                              <span>29th Jan 2021</span>
                              <a href="#" className="minimal-btn">
                                <i className="fal fa-reply" />
                                Reply
                              </a>
                            </div>
                            <div className="comment-text">
                              <p>
                                Lorem ipsum dolor sit amet, consectetur
                                adipisicing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam..
                              </p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="comment-form-wrap mt-40">
                  <h3>Post Comment</h3>
                  <form action="#" className="comment-form">
                    <div className="single-form-input">
                      <textarea
                        placeholder="Type your comments...."
                        defaultValue={""}
                      />
                    </div>
                    <div className="single-form-input">
                      <input type="text" placeholder="Type your name...." />
                    </div>
                    <div className="single-form-input">
                      <input type="email" placeholder="Type your email...." />
                    </div>
                    <div className="single-form-input">
                      <input type="text" placeholder="Type your website...." />
                    </div>
                    <button className="theme-btn" type="submit">
                      <i className="fal fa-comments" />
                      Post Comment
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <BlogSidebar />
          </div>
        </div>
      </section>
    </DanboxLayout>
  );
};

export default CausesPage;
